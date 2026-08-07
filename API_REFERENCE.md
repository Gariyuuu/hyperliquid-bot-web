# API_REFERENCE.md — hyperliquid-bot-web

One internal endpoint exists. No server actions, no RPC functions, no webhooks are received by this app. One external API is called server-side.

---

## Internal endpoints

### `GET /api/market`

- **Source file:** `app/api/market/route.ts`
- **Purpose:** Fetch the current mid price and recent candles for a symbol from Hyperliquid, and compute the EMA-crossover signal server-side.
- **Authentication required:** None.
- **Authorization required:** None.
- **Caching:** Disabled (`export const dynamic = "force-dynamic"`).

**Query parameters** (all optional, all have defaults):

| Param | Type | Default | Notes |
|---|---|---|---|
| `symbol` | string | `"ETH"` | Upper-cased server-side. Must be a valid Hyperliquid perp symbol or the response is a 404. |
| `interval` | string | `"1m"` | One of `1m,5m,15m,30m,1h,4h,1d` (defined in `lib/hyperliquid.ts`'s `INTERVAL_MS`); anything else silently falls back to the `1m` step size inside the candle-fetch helper (not validated/rejected). |
| `fast` | integer string | `"9"` | Fast EMA period. Parsed with `parseInt`, no bounds checking. |
| `slow` | integer string | `"21"` | Slow EMA period. Parsed with `parseInt`, no bounds checking. Also controls how many candles are fetched (`slow + 5` buffer, inside `fetchRecentCloses`). |
| `band` | float string | `"0.0008"` | Neutral-band fraction. Parsed with `parseFloat`, no bounds checking. |

**Request body:** None (GET).

**Success response (200):**
```json
{
  "symbol": "ETH",
  "mid": 1908.35,
  "closes": [1908.8, 1908.5, "... n+5 floats ..."],
  "target": 0,
  "gap": 0.00009973989701654104,
  "ts": 1785967186598
}
```
- `target`: `-1 | 0 | 1` (SHORT/FLAT/LONG).
- `gap`: `number | null` — `null` if there weren't enough candles to compute a signal.
- `ts`: `Date.now()` at response time (client display purposes only).

**Error responses:**
- `404 { "error": "no mid price for <symbol>" }` — symbol not found in Hyperliquid's `allMids` response.
- `502 { "error": "<message>" }` — any other thrown error (e.g., upstream Hyperliquid request failed; message is `err.message` if an `Error`, else `"unknown error"`).

**Side effects:** None (read-only).

**Database operations:** None.

**External calls:** Two, in parallel via `Promise.all` — see below.

**Rate limits:** None enforced by this route. Whatever Hyperliquid enforces upstream is unhandled (no retry/backoff — a rate-limited or erroring upstream call surfaces as a 502 to this route's caller).

**Example request:**
```
GET /api/market?symbol=ETH&interval=1m&fast=9&slow=21&band=0.0008
```

**Known issues:** No input validation beyond parse-with-default. A malicious or careless caller could pass e.g. `fast=-5` or `slow=0`; behavior in that case is **Unable to verify** (not tested) — the EMA math (`lib/strategy.ts`) would likely produce `NaN` or divide-by-zero-adjacent behavior for degenerate periods, but this has not been exercised.

---

## External APIs called by this app

### Hyperliquid public Info API

- **Base URL:** `https://api.hyperliquid.xyz/info` (mainnet — hardcoded in `lib/hyperliquid.ts`)
- **Auth:** None required — fully public.
- **SDK:** None used; raw `fetch()` with `POST` and a JSON body whose `type` field selects the operation.
- **Operations used** (all **Verified** from `lib/hyperliquid.ts`):
  - `{ "type": "allMids" }` → returns a map of symbol → mid price string. Used by `fetchMid()`.
  - `{ "type": "candleSnapshot", "req": { "coin", "interval", "startTime", "endTime" } }` → returns an array of candle objects with a `c` (close) field. Used by `fetchRecentCloses()`.
  - `{ "type": "meta" }` → returns `{ universe: [{ name, szDecimals, ... }] }`. Used by `fetchUniverseSymbols()` — **defined but not currently called anywhere in the app** (dead code / unused export — see `TASKS.md` for whether to remove or keep for future use).
- **Retry/backoff:** None.
- **Rate limits:** Not documented in this codebase; whatever Hyperliquid enforces is unhandled.
- **Environment variables:** None — no API key exists or is needed for these endpoints.

## Webhooks

None received or sent by this app.

## Service accounts

None.
