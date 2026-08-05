// Exact port of hyperliquid-bot/risk.py

export function clampOrderNotional(
  desiredUsd: number,
  currentPositionUsd: number,
  maxPositionUsd: number
): number {
  const headroom = maxPositionUsd - Math.abs(currentPositionUsd);
  if (headroom <= 0) return 0;
  return Math.min(desiredUsd, headroom);
}

export function allowsOrder(notionalUsd: number, minOrderUsd: number): boolean {
  return notionalUsd >= minOrderUsd;
}

export function checkKillSwitch(
  equity: number,
  startEquity: number,
  dailyMaxLossUsd: number
): { halted: boolean; reason?: string } {
  const loss = startEquity - equity;
  if (loss >= dailyMaxLossUsd) {
    return {
      halted: true,
      reason: `Kill switch: session loss $${loss.toFixed(2)} >= max $${dailyMaxLossUsd.toFixed(2)}`,
    };
  }
  return { halted: false };
}
