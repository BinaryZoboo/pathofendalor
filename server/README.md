# Status API (AMP + EconomyCraft)

This backend endpoint exposes live data for the dashboard:

- Online players / max players
- Ping
- EconomyCraft summary from JSON files over SFTP

## 1) Install dependencies

Run this in the project root:

npm install

## 2) Configure environment

Create a `.env` file based on `.env.example`.

Required minimum:

- `MC_HOST`
- `MC_PORT`

Optional AMP source:

- `AMP_STATUS_URL`
- `AMP_BEARER_TOKEN`

Optional EconomyCraft over SFTP:

- `SFTP_HOST`
- `SFTP_PORT`
- `SFTP_USERNAME`
- `SFTP_PASSWORD` (password mode)
- `SFTP_PRIVATE_KEY` (inline private key mode)
- `SFTP_PRIVATE_KEY_PATH` (private key file path mode)
- `SFTP_PASSPHRASE` (if key is encrypted)
- `ECONOMY_JSON_PATH`
- `ECONOMY_CACHE_TTL_MS` (milliseconds, default 600000 = 10 minutes)

Use either password mode OR key mode.

## 3) Start API

npm run api:dev

Endpoint:

GET http://localhost:8787/api/server-status

## 4) Start frontend

npm run dev

Vite proxies `/api/*` to the local API server in development.

## Response shape

```json
{
  "online": true,
  "playersOnline": 14,
  "playersMax": 100,
  "pingMs": 39,
  "refreshedAt": "2026-03-25T12:00:00.000Z",
  "economy": {
    "available": true,
    "accounts": 78,
    "totalBalance": 105200.5,
    "topPlayer": {
      "name": "Nathan",
      "balance": 8400
    }
  }
}
```

## Notes

- Keep AMP and SFTP credentials server-side only.
- `STATUS_CACHE_TTL_MS` avoids hammering AMP/SFTP.
- If AMP is unavailable, the API falls back to direct Minecraft status lookup.
