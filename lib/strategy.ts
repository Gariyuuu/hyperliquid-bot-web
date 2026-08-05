// Exact port of hyperliquid-bot/strategy.py

export function ema(values: number[], period: number): number {
  const k = 2 / (period + 1);
  let out = values[0];
  for (let i = 1; i < values.length; i++) {
    out = values[i] * k + out * (1 - k);
  }
  return out;
}

// Same seeding/recurrence as ema(), but returns the running value at every
// index instead of just the final one — used to draw the EMA lines on the chart.
export function emaSeries(values: number[], period: number): number[] {
  if (values.length === 0) return [];
  const k = 2 / (period + 1);
  const out: number[] = [values[0]];
  for (let i = 1; i < values.length; i++) {
    out.push(values[i] * k + out[i - 1] * (1 - k));
  }
  return out;
}

export type Signal = -1 | 0 | 1;

export function signal(
  closes: number[],
  fastPeriod: number,
  slowPeriod: number,
  neutralBand: number
): { target: Signal; gap: number | null } {
  if (closes.length < slowPeriod) return { target: 0, gap: null };
  const fast = ema(closes, fastPeriod);
  const slow = ema(closes, slowPeriod);
  if (slow <= 0) return { target: 0, gap: null };
  const gap = (fast - slow) / slow;
  if (gap > neutralBand) return { target: 1, gap };
  if (gap < -neutralBand) return { target: -1, gap };
  return { target: 0, gap };
}
