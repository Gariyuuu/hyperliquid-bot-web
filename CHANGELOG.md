# CHANGELOG.md — hyperliquid-bot-web

This mirrors the in-app patch notes (`app/changelog/page.tsx`) plus records this documentation handoff. The in-app page is the user-facing version; this file is the repo-facing version — keep both in sync per `CLAUDE.md`'s permanent rules.

## [Unreleased] — Final transfer checkpoint — 2026-08-07

**No product behavior changed.** Documentation-only pass.

- Added the previously-missing `README.md` (repo had 16/17 canonical docs).
- Re-verified paper-trading-only claim, git state, and secret-scan independently; all clean.
- Found and fixed a stale cross-file claim: `CLAUDE.md`/`PROJECT_STATE.md`/`TASKS.md`/`HANDOFF.md` still said the 17-file doc set was uncommitted and awaiting a decision, but it had already been committed (`70f4a80`). Corrected in all four files.
- Refreshed `HANDOFF.md`'s "Prompt for the next Claude Code account" section.

## [Unreleased] — Documentation handoff — 2026-08-06

**No product behavior was intentionally changed in this entry.** This was a documentation-only audit.

- Created a full 17-file permanent memory/handoff system: `CLAUDE.md`, `PROJECT_STATE.md`, `ARCHITECTURE.md`, `FILE_MAP.md`, `FEATURES.md`, `TASKS.md`, `ROADMAP.md`, `DECISIONS.md`, `DATABASE.md`, `API_REFERENCE.md`, `UI_SYSTEM.md`, `SECURITY.md`, `TESTING.md`, `DEPLOYMENT.md`, this `CHANGELOG.md`, `SESSION_LOG.md`, `HANDOFF.md`.
- Audit found: zero TODO/FIXME/HACK/placeholder/mock markers in the codebase; one genuinely unused export (`lib/hyperliquid.ts`'s `fetchUniverseSymbols`) recorded as technical debt; one previously-undocumented `dangerouslySetInnerHTML` usage in `app/layout.tsx` reviewed and confirmed safe (static constant, not user input) and now documented in `SECURITY.md`.
- No files were deleted, no dependencies changed, no application code was modified as part of this audit, apart from documentation files themselves.

## v0.4.0 — 2026-08-05

- Real favicon/app icon (candlestick mark) instead of the blank default.
- Replaced the light/dark slider with a 4-way theme wheel: Terminal (dark), Paper (light), Matrix, Midnight.
- Regenerated every background: stronger, more visible glow + grid in the dark themes; near-solid, minimal Paper background.
- (Follow-up fix, same version line) Fixed cross-theme color leaks: chart tooltip contrast bug, hardcoded accent colors.

## v0.3.0 — 2026-08-05

- Real PNG background art for dark and light modes — perspective grid + candlestick silhouette.
- Light/dark theme slider in the header, persisted per-browser.
- Added the in-app patch notes page.

## v0.2.0 — 2026-08-05

- Redesigned as a trading-terminal dashboard: glowing hero price card, position meter bar, glassy stat cards.
- Added a live EMA sparkline chart (price + fast/slow EMA lines) with hover crosshair.
- Color-coded BUY/SELL lines in the activity log.

## v0.1.0 — 2026-08-05

- Initial paper-trading dashboard, ported from the hyperliquid-bot Python CLI.
- Reads live public Hyperliquid market data; runs the exact same EMA-crossover signal, position clamp, min-order filter, and session kill-switch as the original bot.
- Simulated $1,000 paper account (0.045% taker fee, 0.05% slippage) stored in browser localStorage.
- Normal / Fast / Crazy mode presets matching the original run.sh / run-fast.sh / run-crazy.sh env overrides.
- Deployed to Vercel.
