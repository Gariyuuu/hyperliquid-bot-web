const BASE_URL = "https://api.hyperliquid.xyz/info";

const INTERVAL_MS: Record<string, number> = {
  "1m": 60_000,
  "5m": 300_000,
  "15m": 900_000,
  "30m": 1_800_000,
  "1h": 3_600_000,
  "4h": 14_400_000,
  "1d": 86_400_000,
};

async function postInfo(body: Record<string, unknown>) {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Hyperliquid info API ${res.status}`);
  return res.json();
}

export async function fetchMid(symbol: string): Promise<number | null> {
  const mids = await postInfo({ type: "allMids" });
  const raw = mids[symbol];
  return raw !== undefined ? parseFloat(raw) : null;
}

// Mirrors hl_client.py recent_closes(n): fetches n+5 buffer candles.
export async function fetchRecentCloses(
  symbol: string,
  interval: string,
  n: number
): Promise<number[]> {
  const step = INTERVAL_MS[interval] ?? INTERVAL_MS["1m"];
  const count = n + 5;
  const endTime = Date.now();
  const startTime = endTime - step * count;
  const candles = await postInfo({
    type: "candleSnapshot",
    req: { coin: symbol, interval, startTime, endTime },
  });
  return (candles as Array<{ c: string }>).map((c) => parseFloat(c.c));
}

export async function fetchUniverseSymbols(): Promise<string[]> {
  const meta = await postInfo({ type: "meta" });
  return (meta.universe as Array<{ name: string }>).map((u) => u.name);
}
