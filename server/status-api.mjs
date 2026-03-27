import dotenv from "dotenv";
import express from "express";
import { status as minecraftStatus } from "minecraft-server-util";
import { readFile } from "node:fs/promises";
import SftpClient from "ssh2-sftp-client";

dotenv.config();

const app = express();
const port = Number(process.env.STATUS_API_PORT ?? 8787);
const cacheTtlMs = Number(process.env.STATUS_CACHE_TTL_MS ?? 10000);
const economyCacheTtlMs = Number(process.env.ECONOMY_CACHE_TTL_MS ?? 900000);

let cached = null;
let cachedAt = 0;
let economyCached = null;
let economyCachedAt = 0;

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function unauthorized(req) {
  const expected = process.env.STATUS_API_KEY;
  if (!expected) return false;
  const got = req.header("x-status-api-key");
  return got !== expected;
}

function parseEconomySummary(rawJson) {
  const economy = {
    available: false,
    accounts: 0,
    totalBalance: 0,
    topPlayer: null,
  };

  if (!rawJson) return economy;

  const entries = Array.isArray(rawJson)
    ? rawJson
    : Array.isArray(rawJson.accounts)
      ? rawJson.accounts
      : Array.isArray(rawJson.players)
        ? rawJson.players
        : [];

  // EconomyCraft commonly stores balances as: { "player-uuid": 1234.5 }
  if (!entries.length && rawJson && typeof rawJson === "object") {
    const mappedEntries = Object.entries(rawJson).map(([id, balance]) => ({
      id,
      balance,
    }));

    if (mappedEntries.length) {
      let topPlayer = null;
      let totalBalance = 0;

      for (const entry of mappedEntries) {
        const normalizedBalance = toNumber(entry.balance);
        if (normalizedBalance === null) continue;

        totalBalance += normalizedBalance;

        if (!topPlayer || normalizedBalance > topPlayer.balance) {
          topPlayer = {
            name: String(entry.id),
            balance: normalizedBalance,
          };
        }
      }

      if (topPlayer) {
        economy.available = true;
        economy.accounts = mappedEntries.length;
        economy.totalBalance = Math.round(totalBalance * 100) / 100;
        economy.topPlayer = topPlayer;
      }

      return economy;
    }
  }

  if (!entries.length) return economy;

  let topPlayer = null;
  let totalBalance = 0;

  for (const entry of entries) {
    const balance = toNumber(
      entry?.balance ?? entry?.money ?? entry?.amount ?? entry?.wallet,
    );

    if (balance === null) continue;

    const playerName =
      entry?.playerName ??
      entry?.name ??
      entry?.username ??
      entry?.id ??
      "Inconnu";

    totalBalance += balance;

    if (!topPlayer || balance > topPlayer.balance) {
      topPlayer = {
        name: String(playerName),
        balance,
      };
    }
  }

  if (topPlayer) {
    economy.available = true;
    economy.accounts = entries.length;
    economy.totalBalance = Math.round(totalBalance * 100) / 100;
    economy.topPlayer = topPlayer;
  }

  return economy;
}

function pickFirstNumber(values) {
  for (const value of values) {
    const number = toNumber(value);
    if (number !== null) return number;
  }
  return null;
}

async function fetchStatusFromAmp() {
  const ampUrl = process.env.AMP_STATUS_URL;
  if (!ampUrl) return null;

  const headers = { "Content-Type": "application/json" };
  if (process.env.AMP_BEARER_TOKEN) {
    headers.Authorization = `Bearer ${process.env.AMP_BEARER_TOKEN}`;
  }

  const response = await fetch(ampUrl, {
    method: "GET",
    headers,
  });

  if (!response.ok) return null;

  const payload = await response.json();

  const playersOnline = pickFirstNumber([
    payload?.playersOnline,
    payload?.players?.online,
    payload?.Metrics?.Players,
  ]);
  const playersMax = pickFirstNumber([
    payload?.playersMax,
    payload?.players?.max,
    payload?.Metrics?.MaxPlayers,
  ]);
  const pingMs = pickFirstNumber([payload?.pingMs, payload?.latency]);

  const online =
    payload?.online === true ||
    payload?.state === "Running" ||
    payload?.running === true ||
    (playersOnline !== null && playersOnline >= 0);

  return {
    online,
    playersOnline: playersOnline ?? 0,
    playersMax: playersMax ?? 0,
    pingMs,
  };
}

async function fetchEconomySummaryFromSftp() {
  const host = process.env.SFTP_HOST;
  const username = process.env.SFTP_USERNAME;
  const password = process.env.SFTP_PASSWORD;
  const privateKeyInline = process.env.SFTP_PRIVATE_KEY;
  const privateKeyPath = process.env.SFTP_PRIVATE_KEY_PATH;
  const passphrase = process.env.SFTP_PASSPHRASE;
  const jsonPath = process.env.ECONOMY_JSON_PATH;

  if (!host || !username || !jsonPath) {
    return {
      available: false,
      accounts: 0,
      totalBalance: 0,
      topPlayer: null,
    };
  }

  let privateKey = null;
  if (privateKeyInline) {
    // Allows multiline key in .env using escaped newlines.
    privateKey = privateKeyInline.replace(/\\n/g, "\n");
  } else if (privateKeyPath) {
    privateKey = await readFile(privateKeyPath, "utf-8");
  }

  if (!password && !privateKey) {
    return {
      available: false,
      accounts: 0,
      totalBalance: 0,
      topPlayer: null,
    };
  }

  const sftp = new SftpClient();

  try {
    await sftp.connect({
      host,
      port: Number(process.env.SFTP_PORT ?? 22),
      username,
      ...(privateKey
        ? {
            privateKey,
            ...(passphrase ? { passphrase } : {}),
          }
        : { password }),
      readyTimeout: Number(process.env.SFTP_TIMEOUT_MS ?? 10000),
    });

    const fileContent = await sftp.get(jsonPath);
    const text = Buffer.isBuffer(fileContent)
      ? fileContent.toString("utf-8")
      : String(fileContent);

    const parsed = JSON.parse(text);
    return parseEconomySummary(parsed);
  } finally {
    await sftp.end();
  }
}

async function getCachedEconomySummary() {
  const now = Date.now();
  if (economyCached && now - economyCachedAt < economyCacheTtlMs) {
    return economyCached;
  }

  try {
    const economy = await fetchEconomySummaryFromSftp();
    economyCached = economy;
    economyCachedAt = now;
    return economy;
  } catch {
    return {
      available: false,
      accounts: 0,
      totalBalance: 0,
      topPlayer: null,
    };
  }
}

async function collectServerStatus() {
  const host = process.env.MC_HOST;
  const port = Number(process.env.MC_PORT ?? 25565);

  if (!host) {
    throw new Error("MC_HOST missing. Set it in .env");
  }

  const startedAt = Date.now();

  let online = false;
  let playersOnline = 0;
  let playersMax = 0;
  let pingMs = null;

  try {
    const ampStatus = await fetchStatusFromAmp();
    if (ampStatus) {
      online = ampStatus.online;
      playersOnline = ampStatus.playersOnline;
      playersMax = ampStatus.playersMax;
      pingMs = ampStatus.pingMs;
    }
  } catch {
    // If AMP data cannot be fetched, fallback to direct server status.
  }

  if (playersMax === 0 && playersOnline === 0) {
    try {
      const response = await minecraftStatus(host, port, {
        timeout: Number(process.env.MC_TIMEOUT_MS ?? 5000),
        enableSRV: true,
      });

      online = true;
      playersOnline = response.players?.online ?? 0;
      playersMax = response.players?.max ?? 0;
      pingMs = Math.max(1, Date.now() - startedAt);
    } catch {
      online = false;
    }
  }

  const economy = await getCachedEconomySummary();

  return {
    online,
    playersOnline,
    playersMax,
    pingMs,
    refreshedAt: new Date().toISOString(),
    economy,
  };
}

app.get("/api/server-status", async (req, res) => {
  if (unauthorized(req)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const now = Date.now();

  if (cached && now - cachedAt < cacheTtlMs) {
    return res.json(cached);
  }

  try {
    const payload = await collectServerStatus();
    cached = payload;
    cachedAt = now;
    return res.json(payload);
  } catch (error) {
    return res.status(500).json({
      error: "Failed to collect server status",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

app.listen(port, () => {
  console.log(`[status-api] listening on http://localhost:${port}`);
});
