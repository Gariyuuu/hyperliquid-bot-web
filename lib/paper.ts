// Exact port of hyperliquid-bot/hl_client.py's PaperBook + bot.py's reconcile(),
// adapted to run client-side against live market data (no real orders, no real keys).

import { clampOrderNotional, allowsOrder, checkKillSwitch } from "./risk";
import type { Signal } from "./strategy";

export const PAPER_START_EQUITY = 1000.0;
const TAKER_FEE = 0.00045;
const PAPER_SLIPPAGE = 0.0005;

export interface PaperState {
  cash: number;
  size: number; // signed coin units
  startEquity: number;
  halted: boolean;
  haltReason?: string;
  trades: number;
}

export function initPaperState(): PaperState {
  return {
    cash: PAPER_START_EQUITY,
    size: 0,
    startEquity: PAPER_START_EQUITY,
    halted: false,
    trades: 0,
  };
}

function equityOf(state: PaperState, mark: number): number {
  return state.cash + state.size * mark;
}

function fill(state: PaperState, deltaSz: number, price: number): PaperState {
  const cash =
    state.cash - deltaSz * price - Math.abs(deltaSz) * price * TAKER_FEE;
  return { ...state, cash, size: state.size + deltaSz, trades: state.trades + 1 };
}

function marketOrder(
  state: PaperState,
  isBuy: boolean,
  sz: number,
  mark: number
): { state: PaperState; action: string } {
  if (sz <= 0) return { state, action: "skipped (size rounds to 0)" };
  const fillPx = mark * (1 + (isBuy ? 1 : -1) * PAPER_SLIPPAGE);
  const next = fill(state, isBuy ? sz : -sz, fillPx);
  return {
    state: next,
    action: `[PAPER] ${isBuy ? "BUY" : "SELL"} ${sz.toFixed(4)} @~${fillPx.toFixed(2)}`,
  };
}

function closePosition(
  state: PaperState,
  mark: number
): { state: PaperState; action: string } {
  if (state.size === 0) return { state, action: "no position to close" };
  const direction = state.size > 0 ? 1 : -1;
  const closePx = mark * (1 - direction * PAPER_SLIPPAGE);
  const next = fill(state, -state.size, closePx);
  return { state: next, action: `[PAPER] CLOSE @~${closePx.toFixed(2)}` };
}

function sign(x: number): -1 | 0 | 1 {
  if (x > 1e-12) return 1;
  if (x < -1e-12) return -1;
  return 0;
}

export interface ReconcileConfig {
  maxPositionUsd: number;
  minOrderUsd: number;
  dailyMaxLossUsd: number;
}

export interface ReconcileResult {
  state: PaperState;
  action: string;
  posUsd: number;
  equity: number;
  pnl: number;
}

// Exact port of bot.py's reconcile() + post-trade status/kill-switch check.
export function reconcile(
  state: PaperState,
  mid: number,
  target: Signal,
  cfg: ReconcileConfig
): ReconcileResult {
  let s = state;
  let action: string;

  const curUsd = s.size * mid;
  const curDir = sign(s.size);

  if (target === 0) {
    if (s.size !== 0) {
      const r = closePosition(s, mid);
      s = r.state;
      action = "closed (target flat)";
    } else {
      action = "flat";
    }
  } else {
    let effectiveCurUsd = curUsd;
    if (curDir !== 0 && curDir !== target) {
      const r = closePosition(s, mid);
      s = r.state;
      effectiveCurUsd = 0;
    }
    const targetUsd = target * cfg.maxPositionUsd;
    const deltaUsd = targetUsd - effectiveCurUsd;
    const orderUsd = clampOrderNotional(
      Math.abs(deltaUsd),
      Math.abs(effectiveCurUsd),
      cfg.maxPositionUsd
    );
    if (!allowsOrder(orderUsd, cfg.minOrderUsd)) {
      action = "hold (order too small)";
    } else {
      const sz = orderUsd / mid;
      const r = marketOrder(s, target > 0, sz, mid);
      s = r.state;
      action = r.action;
    }
  }

  const posUsd = s.size * mid;
  const equity = equityOf(s, mid);
  const pnl = equity - s.startEquity;

  const kill = checkKillSwitch(equity, s.startEquity, cfg.dailyMaxLossUsd);
  if (kill.halted && !s.halted) {
    const closed = closePosition(s, mid);
    s = { ...closed.state, halted: true, haltReason: kill.reason };
    action = `${action} -> ${kill.reason}`;
  }

  return { state: s, action, posUsd: s.size * mid, equity: equityOf(s, mid), pnl: equityOf(s, mid) - s.startEquity };
}
