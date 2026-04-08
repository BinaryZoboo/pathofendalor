import dotenv from "dotenv";
import express from "express";
import { status as minecraftStatus } from "minecraft-server-util";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import SftpClient from "ssh2-sftp-client";

dotenv.config();

const app = express();
const port = Number(process.env.STATUS_API_PORT ?? 8787);
const cacheTtlMs = Number(process.env.STATUS_CACHE_TTL_MS ?? 10000);
const economyCacheTtlMs = Number(process.env.ECONOMY_CACHE_TTL_MS ?? 900000);
const playerNameCacheTtlMs = Number(
  process.env.PLAYER_NAME_CACHE_TTL_MS ?? 86400000,
);
const enableMojangNameLookup =
  (process.env.ENABLE_MOJANG_NAME_LOOKUP ?? "true").toLowerCase() !== "false";
const cityHallHistoryPath =
  process.env.AUCTION_HOUSE_HISTORY_PATH ??
  process.env.CITYHALL_HISTORY_PATH ??
  "./server/data/auction-house-listing-history.json";

let cached = null;
let cachedAt = 0;
let economyCached = null;
let economyCachedAt = 0;
let cityHallSalesCached = null;
let cityHallSalesCachedAt = 0;
const playerNameCache = new Map();
let cityHallListingHistory = null;

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

function toSafeText(value, fallback) {
  if (value === null || value === undefined) return fallback;
  const text = String(value).trim();
  return text.length ? text : fallback;
}

function isLikelyUuid(value) {
  return /^[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}$/i.test(
    value,
  );
}

function toUuidNoHyphen(value) {
  return value.replace(/-/g, "").toLowerCase();
}

async function fetchMojangPlayerName(uuidNoHyphen) {
  const timeoutMs = Number(process.env.MOJANG_TIMEOUT_MS ?? 5000);
  const controller = new AbortController();
  const timerId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(
      `https://sessionserver.mojang.com/session/minecraft/profile/${uuidNoHyphen}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        signal: controller.signal,
      },
    );

    if (!response.ok) {
      return null;
    }

    const payload = await response.json();
    const name = toSafeText(payload?.name, "");
    return name || null;
  } catch {
    return null;
  } finally {
    clearTimeout(timerId);
  }
}

async function resolvePlayerName(value) {
  const raw = toSafeText(value, "");
  if (!raw || !isLikelyUuid(raw)) {
    return raw || "Inconnu";
  }

  if (!enableMojangNameLookup) {
    return raw;
  }

  const uuidNoHyphen = toUuidNoHyphen(raw);
  const cachedValue = playerNameCache.get(uuidNoHyphen);
  const now = Date.now();

  if (cachedValue && now - cachedValue.cachedAt < playerNameCacheTtlMs) {
    return cachedValue.name;
  }

  const resolved = await fetchMojangPlayerName(uuidNoHyphen);
  const finalName = resolved ?? raw;

  playerNameCache.set(uuidNoHyphen, {
    name: finalName,
    cachedAt: now,
  });

  return finalName;
}

async function hydrateEconomySummaryNames(economy) {
  if (!economy?.topPlayer?.name) {
    return economy;
  }

  return {
    ...economy,
    topPlayer: {
      ...economy.topPlayer,
      name: await resolvePlayerName(economy.topPlayer.name),
    },
  };
}

async function hydrateCityHallSalesNames(payload) {
  const sales = Array.isArray(payload?.sales) ? payload.sales : [];
  if (!sales.length) {
    return payload;
  }

  const uniqueSellers = [...new Set(sales.map((sale) => sale.seller))];
  const namePairs = await Promise.all(
    uniqueSellers.map(async (seller) => [
      seller,
      await resolvePlayerName(seller),
    ]),
  );
  const sellerNameMap = new Map(namePairs);

  return {
    ...payload,
    sales: sales.map((sale) => ({
      ...sale,
      seller: sellerNameMap.get(sale.seller) ?? sale.seller,
    })),
  };
}

function parseDateToIso(value) {
  if (value === null || value === undefined) return null;

  if (typeof value === "number" && Number.isFinite(value)) {
    const millis = value < 10_000_000_000 ? value * 1000 : value;
    return new Date(millis).toISOString();
  }

  if (typeof value === "string") {
    const fromString = Date.parse(value);
    if (!Number.isNaN(fromString)) {
      return new Date(fromString).toISOString();
    }
  }

  return null;
}

function toRoman(value) {
  const numerals = [
    [10, "X"],
    [9, "IX"],
    [5, "V"],
    [4, "IV"],
    [1, "I"],
  ];

  let remaining = Math.max(1, Math.floor(value));
  let output = "";

  for (const [unit, symbol] of numerals) {
    while (remaining >= unit) {
      output += symbol;
      remaining -= unit;
    }
  }

  return output || "I";
}

function formatEnchantmentName(rawKey) {
  const cleanKey = toSafeText(rawKey, "").replace(/^minecraft:/i, "");
  if (!cleanKey) return "Enchantement";

  return cleanKey
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function normalizeEnchantmentPairs(levels) {
  if (!levels) return [];

  if (Array.isArray(levels)) {
    return levels
      .map((entry) => {
        if (!entry || typeof entry !== "object") return null;

        const key =
          entry.id ??
          entry.enchantment ??
          entry.key ??
          entry.name ??
          entry.type;

        const level =
          toNumber(entry.level ?? entry.lvl ?? entry.value ?? entry.amount) ??
          null;

        if (!key || level === null) return null;
        return [String(key), level];
      })
      .filter(Boolean);
  }

  if (typeof levels === "object") {
    return Object.entries(levels)
      .map(([name, level]) => {
        const levelNumber = toNumber(level);
        if (levelNumber === null) return null;
        return [name, levelNumber];
      })
      .filter(Boolean);
  }

  return [];
}

function findEnchantmentLevels(container) {
  if (!container || typeof container !== "object") {
    return null;
  }

  const directCandidates = [
    container?.components?.["minecraft:enchantments"]?.levels,
    container?.components?.["minecraft:stored_enchantments"]?.levels,
    container?.components?.enchantments?.levels,
    container?.components?.stored_enchantments?.levels,
    container?.enchantments?.levels,
    container?.stored_enchantments?.levels,
    container?.enchantments,
  ];

  for (const candidate of directCandidates) {
    if (candidate && typeof candidate === "object") {
      return candidate;
    }
  }

  return null;
}

function parseEnchantments(entry) {
  const containers = [
    entry,
    entry?.item,
    entry?.stack,
    entry?.itemStack,
    entry?.listing,
    entry?.offer,
    entry?.data,
  ];

  for (const container of containers) {
    const levels = findEnchantmentLevels(container);
    if (!levels) continue;

    const pairs = normalizeEnchantmentPairs(levels);
    if (!pairs.length) continue;

    return pairs.map(
      ([name, level]) => `${formatEnchantmentName(name)} ${toRoman(level)}`,
    );
  }

  return [];
}

function buildCityHallTrackingKey(entry, normalizedSale) {
  const explicitId = toSafeText(
    entry?.id ?? entry?.uuid ?? entry?.listingId ?? entry?.offerId,
    "",
  );

  if (explicitId) {
    return `id:${explicitId.toLowerCase()}`;
  }

  const sellerKey = normalizedSale.seller.toLowerCase();
  const itemKey = normalizedSale.itemName.toLowerCase();
  const enchantmentsKey = normalizedSale.enchantments.join("|").toLowerCase();

  return `fp:${sellerKey}::${itemKey}::${normalizedSale.price}::${normalizedSale.quantity}::${enchantmentsKey}`;
}

async function readCityHallListingHistory() {
  if (cityHallListingHistory) {
    return cityHallListingHistory;
  }

  try {
    const raw = await readFile(cityHallHistoryPath, "utf-8");
    const parsed = JSON.parse(raw);
    const listings = parsed?.listings;

    cityHallListingHistory =
      listings && typeof listings === "object" ? listings : {};
  } catch {
    cityHallListingHistory = {};
  }

  return cityHallListingHistory;
}

async function writeCityHallListingHistory(history) {
  cityHallListingHistory = history;

  await mkdir(dirname(cityHallHistoryPath), { recursive: true });
  await writeFile(
    cityHallHistoryPath,
    JSON.stringify(
      {
        updatedAt: new Date().toISOString(),
        listings: history,
      },
      null,
      2,
    ),
    "utf-8",
  );
}

async function applyApproximateListingDates(payload) {
  const sales = Array.isArray(payload?.sales) ? payload.sales : [];
  const history = await readCityHallListingHistory();
  const nextHistory = {};
  const nowIso = new Date().toISOString();

  const normalizedSales = sales.map((sale) => {
    const trackingKey = toSafeText(
      sale.trackingKey,
      `legacy:${toSafeText(sale.id, "unknown")}`,
    );
    const knownListedAt =
      typeof history[trackingKey] === "string" ? history[trackingKey] : null;

    const listedAt = sale.listedAt ?? knownListedAt ?? nowIso;
    nextHistory[trackingKey] = listedAt;

    const { trackingKey: _internalTrackingKey, ...cleanSale } = sale;
    return {
      ...cleanSale,
      listedAt,
    };
  });

  const prevKeys = Object.keys(history).sort();
  const nextKeys = Object.keys(nextHistory).sort();

  let hasChanged = prevKeys.length !== nextKeys.length;
  if (!hasChanged) {
    for (let i = 0; i < nextKeys.length; i += 1) {
      const key = nextKeys[i];
      if (prevKeys[i] !== key || history[key] !== nextHistory[key]) {
        hasChanged = true;
        break;
      }
    }
  }

  if (hasChanged) {
    await writeCityHallListingHistory(nextHistory);
  }

  return {
    ...payload,
    sales: normalizedSales,
  };
}

function parseCityHallSales(rawJson) {
  const empty = {
    available: false,
    count: 0,
    updatedAt: new Date().toISOString(),
    sales: [],
  };

  if (!rawJson) return empty;

  const sourceEntries = Array.isArray(rawJson)
    ? rawJson
    : Array.isArray(rawJson.sales)
      ? rawJson.sales
      : Array.isArray(rawJson.listings)
        ? rawJson.listings
        : Array.isArray(rawJson.items)
          ? rawJson.items
          : rawJson?.sales && typeof rawJson.sales === "object"
            ? Object.values(rawJson.sales)
            : rawJson?.listings && typeof rawJson.listings === "object"
              ? Object.values(rawJson.listings)
              : rawJson?.items && typeof rawJson.items === "object"
                ? Object.values(rawJson.items)
                : rawJson && typeof rawJson === "object"
                  ? Object.values(rawJson)
                  : [];

  const normalized = [];

  for (let i = 0; i < sourceEntries.length; i += 1) {
    const entry = sourceEntries[i];
    if (!entry || typeof entry !== "object") continue;

    const price = pickFirstNumber([
      entry.price,
      entry.unitPrice,
      entry.cost,
      entry.value,
      entry.amount,
      entry.total,
    ]);

    if (price === null) continue;

    const quantity =
      pickFirstNumber([
        entry.quantity,
        entry.amount,
        entry.count,
        entry.stack,
      ]) ?? 1;

    const seller = toSafeText(
      entry.seller ?? entry.playerName ?? entry.owner ?? entry.username,
      "Inconnu",
    );

    const itemName = toSafeText(
      entry.itemName ?? entry.item ?? entry.material ?? entry.id,
      "Objet inconnu",
    );

    const listedAt = parseDateToIso(
      entry.listedAt ?? entry.createdAt ?? entry.date ?? entry.timestamp,
    );

    const expiresAt = parseDateToIso(
      entry.expiresAt ?? entry.expiration ?? entry.expireAt,
    );
    const enchantments = parseEnchantments(entry);

    const normalizedSale = {
      id: toSafeText(entry.id ?? entry.uuid ?? i, String(i)),
      seller,
      itemName,
      price,
      quantity,
      totalPrice: Math.round(price * quantity * 100) / 100,
      currency: toSafeText(entry.currency ?? "$", "$"),
      listedAt,
      expiresAt,
      enchantments,
    };

    normalized.push({
      ...normalizedSale,
      trackingKey: buildCityHallTrackingKey(entry, normalizedSale),
    });
  }

  return {
    available: normalized.length > 0,
    count: normalized.length,
    updatedAt:
      parseDateToIso(rawJson.updatedAt ?? rawJson.refreshedAt) ??
      new Date().toISOString(),
    sales: normalized,
  };
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
    const hydratedEconomy = await hydrateEconomySummaryNames(economy);
    economyCached = hydratedEconomy;
    economyCachedAt = now;
    return hydratedEconomy;
  } catch {
    return {
      available: false,
      accounts: 0,
      totalBalance: 0,
      topPlayer: null,
    };
  }
}

async function fetchCityHallSalesFromSftp() {
  const host = process.env.SFTP_HOST;
  const username = process.env.SFTP_USERNAME;
  const password = process.env.SFTP_PASSWORD;
  const privateKeyInline = process.env.SFTP_PRIVATE_KEY;
  const privateKeyPath = process.env.SFTP_PRIVATE_KEY_PATH;
  const passphrase = process.env.SFTP_PASSPHRASE;
  const jsonPath =
    process.env.ECONOMY_AUCTION_HOUSE_JSON_PATH ??
    process.env.ECONOMY_CITYHALL_JSON_PATH ??
    process.env.ECONOMY_HDV_JSON_PATH;

  if (!host || !username || !jsonPath) {
    return {
      available: false,
      count: 0,
      updatedAt: new Date().toISOString(),
      sales: [],
    };
  }

  let privateKey = null;
  if (privateKeyInline) {
    privateKey = privateKeyInline.replace(/\\n/g, "\n");
  } else if (privateKeyPath) {
    privateKey = await readFile(privateKeyPath, "utf-8");
  }

  if (!password && !privateKey) {
    return {
      available: false,
      count: 0,
      updatedAt: new Date().toISOString(),
      sales: [],
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
    return parseCityHallSales(parsed);
  } finally {
    await sftp.end();
  }
}

async function getCachedCityHallSales() {
  const now = Date.now();
  if (cityHallSalesCached && now - cityHallSalesCachedAt < economyCacheTtlMs) {
    return cityHallSalesCached;
  }

  try {
    const payload = await fetchCityHallSalesFromSftp();
    const hydratedPayload = await hydrateCityHallSalesNames(payload);
    const payloadWithApproxDates =
      await applyApproximateListingDates(hydratedPayload);
    cityHallSalesCached = payloadWithApproxDates;
    cityHallSalesCachedAt = now;
    return payloadWithApproxDates;
  } catch {
    return {
      available: false,
      count: 0,
      updatedAt: new Date().toISOString(),
      sales: [],
    };
  }
}

async function collectServerStatus() {
  const host = process.env.MC_HOST;
  const port = Number(process.env.MC_PORT ?? 25565);

  if (!host) {
    throw new Error("MC_HOST missing. Set it in .env");
  }

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

  try {
    const response = await minecraftStatus(host, port, {
      timeout: Number(process.env.MC_TIMEOUT_MS ?? 5000),
      enableSRV: true,
    });

    // Prefer direct server round-trip latency over AMP latency to avoid inflated values.
    const directPing = pickFirstNumber([
      response?.roundTripLatency,
      response?.latency,
    ]);
    if (directPing !== null) {
      pingMs = Math.max(1, Math.round(directPing));
    }

    if (playersMax === 0 && playersOnline === 0) {
      online = true;
      playersOnline = response.players?.online ?? 0;
      playersMax = response.players?.max ?? 0;
    }
  } catch {
    if (playersMax === 0 && playersOnline === 0) {
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

const handleAuctionHouseSales = async (req, res) => {
  if (unauthorized(req)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const payload = await getCachedCityHallSales();
    return res.json(payload);
  } catch (error) {
    return res.status(500).json({
      error: "Failed to fetch auction house sales",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

app.get("/api/auction-house-sales", handleAuctionHouseSales);
app.get("/api/cityhall-sales", handleAuctionHouseSales);

app.listen(port, () => {
  console.log(`[status-api] listening on http://localhost:${port}`);
});
