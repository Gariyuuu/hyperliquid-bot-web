# hyperliquid-bot-web

A read-only, **paper-trading-only** web dashboard that mirrors the EMA-crossover trading strategy of a separate Python CLI bot (`~/Projects/hyperliquid-bot`). It polls live public Hyperliquid market data, computes the same EMA(9/21) crossover signal the Python bot uses, and runs a client-side simulated $1,000 account so you can watch the strategy behave without any financial risk.

**Live:** https://hyperliquid-bot-web-alpha.vercel.app

## No real money, no real orders

This app **never places a real order and never accepts an exchange private key or API credential of any kind.** Verified in the current codebase:

- `package.json` has exactly three runtime dependencies — `next`, `react`, `react-dom`. No Hyperliquid SDK, no `ethers`/`viem`, no signing library of any kind.
- `lib/hyperliquid.ts` only calls the public, unauthenticated `POST https://api.hyperliquid.xyz/info` endpoint (`allMids` / `candleSnapshot`) — read-only market data, no order-placement or account endpoints.
- There is no `process.env.*` reference anywhere in `app/` or `lib/` — the app requires zero environment variables, secret or otherwise, to run.
- All "trading" happens in `lib/paper.ts`, a pure in-memory fill simulator (starting balance $1,000, modeled fee/slippage) — state lives only in the browser's `localStorage`, nothing is sent to any exchange.

If this ever needs to change (real order placement), treat it as a new architectural decision, not an incremental change — see `CLAUDE.md` → "DO NOT CHANGE WITHOUT REVIEW" and `DECISIONS.md` D-001.

## What it does

- Polls live Hyperliquid price/candle data for a chosen perp symbol (ETH, BTC, SOL, ARB, DOGE) on an interval you control.
- Computes an EMA(9/21) crossover LONG/SHORT/FLAT signal, shown alongside a live sparkline chart of price + both EMA lines.
- Runs a paper-trading reconcile loop against a simulated $1,000 account with the same position-sizing, min-order, and kill-switch rules as the Python bot's dry-run mode.
- Ships three one-click mode presets (Normal / Fast / Crazy) matching the Python bot's `run.sh` / `run-fast.sh` / `run-crazy.sh` env overrides.
- Four selectable visual themes (Terminal, Paper, Matrix, Midnight), each with its own background art, persisted per-browser.

## Stack

- **Framework:** Next.js 15 (App Router), React 19, TypeScript 5
- **Styling:** Plain CSS with CSS custom properties for theming — no CSS framework
- **State:** React `useState` + browser `localStorage` (key `hlbot-web-state-v1`) — no database, no backend state
- **Backend:** One Next.js Route Handler (`GET /api/market`), stateless, proxies the public Hyperliquid Info API
- **Hosting:** Vercel

## Run locally

```bash
npm install
npm run dev
```

Then open http://localhost:3000. No environment variables or `.env` file are required — the app has zero required config.

To exercise a production build locally:

```bash
npm run build
npm run start -- -p 3411
```

## Project layout

```
app/                     Next.js App Router root — single-page dashboard UI
  page.tsx               The entire dashboard (client component)
  api/market/route.ts    The only API route — fetches live Hyperliquid data + computes the signal
  PriceChart.tsx          Inline SVG price + EMA chart
  ThemeWheel.tsx           4-theme picker
  changelog/page.tsx      Static in-app patch notes page
lib/                     Pure TypeScript trading logic (framework-agnostic, hand-ported from the Python bot)
  strategy.ts            EMA + crossover signal
  risk.ts                Position clamp / min-order filter / kill-switch
  paper.ts               Paper-trading fill simulator
  hyperliquid.ts          Server-side fetch helpers for the public Hyperliquid Info API
```

## Documentation

This repo carries a full in-repo documentation set for account-switch / handoff purposes. Start with `CLAUDE.md`, then `PROJECT_STATE.md` and `TASKS.md`. See `FILE_MAP.md` for a guide to every other doc.

## Related project

`~/Projects/hyperliquid-bot` is the original Python CLI bot this dashboard mirrors. It is a **separate, unrelated git repository** — there is no shared code or dependency between the two. Changes to the Python bot's strategy must be manually ported to `lib/strategy.ts` / `lib/risk.ts` / `lib/paper.ts` if you want this dashboard to stay in sync.
