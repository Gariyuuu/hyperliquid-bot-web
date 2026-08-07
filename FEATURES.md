# FEATURES.md — hyperliquid-bot-web

Status classifications follow the scheme: Verified complete / Mostly complete / Partially implemented / UI only / Backend only / Mocked / Planned / Broken / Deprecated / Unable to verify.

---

## 1. Live market data polling

- **Purpose:** Show a real, live price for a chosen Hyperliquid perp symbol.
- **User flow:** User selects a symbol (ETH/BTC/SOL/ARB/DOGE) and interval, presses Start; the price updates every `pollSeconds`.
- **Status: Verified complete.** Confirmed end-to-end: UI → `fetch('/api/market')` → `lib/hyperliquid.ts` → live Hyperliquid API → response → UI re-render. Manually tested this session against the live API (not mocked).
- **Frontend files:** `app/page.tsx` (symbol/interval selects, `tick()`), `app/PriceChart.tsx` (chart rendering).
- **Backend files:** `app/api/market/route.ts`, `lib/hyperliquid.ts`.
- **Database dependencies:** None.
- **External integrations:** Hyperliquid public Info API.
- **Environment variables:** None required.
- **Permissions:** None — fully public.
- **Validation:** Minimal — symbol/interval/fast/slow/band are read from query params with fallback defaults; no bounds-checking on numeric ranges (see Known issues in `CLAUDE.md`/`TASKS.md`).
- **Error states:** Non-existent symbol → 404 `{error}` from the route, surfaced as a red log line client-side. Upstream fetch failure → 502, same surfacing.
- **Loading states:** None explicit — price shows `"—"` until first successful fetch.
- **Edge cases:** Symbol not in Hyperliquid's `allMids` → handled (404). Interval not in the known map → silently falls back to `"1m"` step size inside `lib/hyperliquid.ts` (not surfaced as an error — worth knowing if you add a new interval option to the UI without adding it to `INTERVAL_MS`).
- **Tests:** None.
- **Known issues:** None open.
- **Remaining work:** None planned.

## 2. EMA crossover signal

- **Purpose:** Compute the same LONG/SHORT/FLAT signal the Python bot computes, from live candle data.
- **User flow:** Automatic, tied to feature 1's poll loop; shown as the "Signal" pill and the "Gap" percentage in the hero card.
- **Status: Verified complete.** `lib/strategy.ts`'s `signal()` is called server-side in the route handler; the exact same function's `ema()`/`emaSeries()` are reused client-side for the chart, so the displayed chart lines and the computed signal are guaranteed consistent (same source function).
- **Frontend files:** `app/page.tsx` (signal pill/gap display), `app/PriceChart.tsx` (EMA lines).
- **Backend files:** `app/api/market/route.ts`, `lib/strategy.ts`.
- **Validation:** None beyond what's inherited from feature 1.
- **Edge cases:** Fewer candles than `slow` period → returns `target: 0, gap: null` (handled, shown as `FLAT` / `—`).
- **Known issues:** None.
- **Remaining work:** None planned.

## 3. Paper-trading simulation (reconcile loop)

- **Purpose:** Simulate what the real bot would do with the computed signal, against a fake $1,000 account, with the same risk rules and fee/slippage model as the Python bot's dry-run mode.
- **User flow:** Runs automatically every poll tick once Start is pressed. Position/Equity/Session PnL/Trades update live; the activity log shows each cycle's action (`BUY`/`SELL`/`CLOSE`/`hold`/kill-switch message).
- **Status: Verified complete** for the paper-simulation piece. This is **not** connected to any real exchange — that is intentional, not a gap (see `CLAUDE.md`).
- **Frontend/logic files:** `app/page.tsx` (`tick()` calls `reconcile()`), `lib/paper.ts`, `lib/risk.ts`.
- **Database dependencies:** None — state lives in React state + `localStorage`.
- **Validation:** None on user-editable risk params (`maxPositionUsd`, `dailyMaxLossUsd`, `minOrderUsd` can be set to any number including 0 or negative via the number inputs — not exercised/known what happens with a negative max position; **Unable to verify** without deliberately testing a negative input).
- **Error states:** Kill-switch trip is handled explicitly (`paper.halted`), shown as a red "HALTED — <reason>" pill, and disables the Start button until Reset.
- **Loading/empty states:** Before the first tick, all stats show `$0.00`/`—` (the initial `PaperState`).
- **Edge cases:** Direction flip (long→short or vice versa) correctly closes the existing position before opening the new one (mirrors the Python `reconcile()` — see `lib/paper.ts` comment). Order-too-small-to-execute is handled (`allowsOrder` check) and logged as "hold (order too small)".
- **Tests:** None automated. Manually observed behavior this session matched expectations (flat→long, long→short flip, kill-switch trip in "Crazy mode" preset which is specifically designed to blow up the paper account fast).
- **Known issues:** None open.
- **Remaining work:** None planned. (Possible future idea, not started: persisting paper-account history server-side for cross-device continuity — would be a new architecture decision, not a bug fix.)

## 4. Mode presets (Normal / Fast / Crazy)

- **Purpose:** One-click apply of the same env-var override sets the Python bot's `run.sh`/`run-fast.sh`/`run-crazy.sh` scripts used.
- **Status: Verified complete.** Exact values cross-checked against the Python scripts during original build (see `DECISIONS.md` D-001).
- **Frontend files:** `app/page.tsx` (`PRESETS` object, `applyPreset()`).
- **Edge cases:** Presets are disabled while `running` is true (button `disabled={running}`), preventing a mid-session config change that the poll loop wouldn't pick up correctly (the `useEffect` interval would restart with new deps, which is actually fine, but disabling avoids user confusion about *when* the new params take effect).
- **Known issues:** None.

## 5. Theme wheel (4 themes)

- **Purpose:** Let the user pick a visual theme; each theme is a distinct color palette + background PNG.
- **User flow:** Click a swatch in the header; theme changes instantly and persists across reloads.
- **Status: Verified complete.** All 4 themes (Terminal/Paper/Matrix/Midnight) confirmed rendering correctly and distinctly via Playwright screenshots against the live deployment this session, after fixing two cross-theme color bugs (see `PROJECT_STATE.md`).
- **Frontend files:** `app/ThemeWheel.tsx`, `app/layout.tsx` (no-flash init script), `app/globals.css` (all 4 variable blocks).
- **Database dependencies:** None — `localStorage` only.
- **Accessibility:** `role="radiogroup"`/`role="radio"`/`aria-checked` present; not independently tested with assistive tech.
- **Known issues:** None open (two were found and fixed this session, see `PROJECT_STATE.md`).
- **Remaining work:** None planned; architecture supports adding more themes easily (see `FILE_MAP.md` → "Where to make common changes").

## 6. Live EMA sparkline chart

- **Purpose:** Visual confirmation of the price + both EMA lines, with hover crosshair/tooltip.
- **Status: Verified complete.**
- **Frontend files:** `app/PriceChart.tsx`.
- **Edge cases:** Fewer than 2 candles → shows "Waiting for enough candles…" placeholder instead of an empty/broken chart (handled).
- **Known issues:** None.

## 7. Patch notes / changelog page

- **Purpose:** Human-readable version history, linked from the header.
- **Status: Verified complete**, but is a **hand-maintained static array** — it does not auto-generate from git history or commit messages. Whoever makes a "meaningful" change is responsible for manually adding an entry (see `CLAUDE.md` permanent rules — this is analogous to the doc-update discipline requested for this whole memory system).
- **Frontend files:** `app/changelog/page.tsx`.
- **Known issues:** None functionally; the risk is purely that it goes stale if someone forgets to update it (this already happened once mid-session and was caught/fixed).

## Features NOT present (explicitly, to prevent future re-discovery effort)

- No live trading / real order placement.
- No user accounts, login, or multi-user support.
- No database or server-side persistence of any kind.
- No mobile app.
- No notifications/alerts (email, push, webhook).
- No historical performance charting beyond the current session's in-memory log.
- No support for exchanges other than Hyperliquid.
