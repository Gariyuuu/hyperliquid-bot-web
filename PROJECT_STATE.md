# PROJECT_STATE.md — hyperliquid-bot-web

**Audit timestamp:** 2026-08-06, third pass (account-switch checkpoint; two prior documentation passes were earlier the same day — see `SESSION_LOG.md`)
**Current branch:** `main`
**Latest commit:** `7df08aa7718b168085f64ecc4c8fbecced9b9626` — "Fix cross-theme color leaks: chart tooltip contrast bug, hardcoded accent colors" (unchanged since the first audit — no application code has changed across any of the three documentation passes)
**Working tree:** **Not clean.** 17 untracked documentation files exist at the repo root (`API_REFERENCE.md`, `ARCHITECTURE.md`, `CHANGELOG.md`, `CLAUDE.md`, `DATABASE.md`, `DECISIONS.md`, `DEPLOYMENT.md`, `FEATURES.md`, `FILE_MAP.md`, `HANDOFF.md`, `PROJECT_STATE.md`, `ROADMAP.md`, `SECURITY.md`, `SESSION_LOG.md`, `TASKS.md`, `TESTING.md`, `UI_SYSTEM.md`) — Verified via `git status --short`. These are the permanent memory/handoff system created during the first audit and refreshed during this checkpoint; **no application source file is uncommitted.** These files have not been committed — that is a deliberate pending decision, not an oversight (the user has not yet said whether to commit them).

---

## Active development objective

None. The feature work requested by the user (build a Vercel dashboard mirroring the Python bot, then iteratively improve its UI/UX with real backgrounds, a theme picker, and icons) is complete and deployed. The only activity since has been two documentation/checkpoint passes (this being the second), neither of which changed application behavior.

## Last completed task

**This account-switch checkpoint (third pass, task `C-003`)** (the task currently described in full in `TASKS.md`'s "Current task" section — read that for the complete objective/completed/remaining/acceptance-criteria breakdown). This pass independently re-derived the repository's state from scratch (no memory of the prior two passes' conversations) and found **zero drift**: `git status`/`git log`/`HEAD` unchanged, all 17 doc files still present/untracked/accurate. Additionally, this pass did a direct code spot-check of the paper-trading-only claim (D-001) that the prior two passes had not explicitly re-run: grepped `app/` and `lib/` for `privateKey`/`signer`/`placeOrder`/`Exchange`/`wallet`/`secret` (zero matches), confirmed `package.json` has only `next`/`react`/`react-dom` as runtime dependencies (no Hyperliquid SDK, no signing library like `ethers`/`viem`), read `lib/paper.ts` end-to-end (pure arithmetic fill simulator, no network calls), and confirmed `app/api/market/route.ts` only imports `signal` from `lib/strategy` and never references an order-placement endpoint. **Paper-trading-only status re-confirmed, unchanged.**

Prior pass (second, `C-002`): re-verified git state, refreshed all 17 memory files, added one previously-undocumented design decision (`DECISIONS.md` D-008 — the EMA chart line colors were deliberately chosen from a validated colorblind-safe palette, not arbitrary), re-confirmed no secrets are present in any doc file, and re-confirmed the "current task" statement is consistent across `CLAUDE.md`/`PROJECT_STATE.md`/`TASKS.md`/`HANDOFF.md`.

Before that (first audit, same day): fixed two cross-theme CSS bugs found during a visual QA pass with real Playwright screenshots:
1. Chart tooltip (`app/PriceChart.tsx` / `.chart-tooltip` in `app/globals.css`) had a hardcoded near-black background (`rgba(10,12,16,0.95)`) but theme-following text color — illegible in the Paper (light) theme. Fixed by switching the background to `var(--surface-solid)` and text to `var(--text)`.
2. Several accent-colored UI touches (`.hero-price::before` glow, `.dot.fast`/`.dot.slow` glow, `button.primary` gradient/shadow) used hardcoded `rgba(57,135,229,...)` (the Terminal theme's blue) instead of `var(--blue)`, so they stayed blue-tinted even in the Matrix (green) and Midnight (violet) themes. Fixed with `color-mix(in srgb, var(--blue) N%, transparent)`.

Both fixes were verified visually via fresh Playwright screenshots of the live deployment after redeploying, across all 4 themes.

## Current unfinished task

None in terms of application features. This checkpoint itself is the only active "task" and is complete as of this writing (see `TASKS.md`).

## Files related to the (non-existent) unfinished feature task

N/A — no feature work is pending. See `TASKS.md` for the checkpoint task's own file list (it touches only documentation files).

## What has already been attempted

Everything attempted this session succeeded and is deployed. Nothing was abandoned mid-way. One dead end worth recording: an early attempt to add "light beam" decorative shapes to the sports-betting-web dark background (a sibling repo, not this one) was tried and explicitly reverted for looking bad — see that repo's `DECISIONS.md`. Not applicable to this repo directly, but the same generator script (`gen_bg2.py`, run from a scratch directory, not committed to either repo) produces this repo's PNGs too, so it's relevant context if regenerating backgrounds.

## What currently works (Verified this session)

- `npm run build` completes cleanly (0 errors) at commit `7df08aa`.
- Live production URL (`https://hyperliquid-bot-web-alpha.vercel.app`) returns HTTP 200 for `/`, `/changelog`, `/icon.png`, `/bg-dark.png`, `/bg-light.png`, `/bg-matrix.png`, `/bg-violet.png`.
- `/api/market?symbol=ETH&interval=1m&fast=9&slow=21&band=0.0008` returns live Hyperliquid price/signal data (spot-checked locally against `npm run start`).
- All 4 themes render correctly and distinctly (Verified via Playwright screenshots against the live deployment).
- Theme selection persists via `localStorage` (`hlbot-theme` key) and there is no flash-of-wrong-theme on reload (inline script in `layout.tsx`).
- The paper-trading reconcile loop, position meter, EMA chart, and mode presets (Normal/Fast/Crazy) all render with plausible-looking state in a fresh session (Verified visually; the actual multi-minute trading behavior over a live session was not exhaustively re-verified this specific audit — see Unverified below).

## What currently fails

Nothing known. No open bugs.

## Errors currently observed

None.

## Blockers

None.

## Assumptions currently in effect

- Assuming the Vercel project `garywangsmes-8349s-projects/hyperliquid-bot-web` remains linked to the same GitHub repo and Vercel account used throughout this session (**Inferred**, not re-verified with a fresh `vercel whoami` this specific audit pass, but was true earlier this session and nothing has changed it).
- Assuming Hyperliquid's public Info API contract (`allMids`, `candleSnapshot` request/response shape) has not changed since it was last exercised this session.
- Assuming no one has manually edited files in the Vercel dashboard (e.g., env vars) outside of this session's `vercel env add`/`vercel --prod` calls. This app has zero env vars so this is low-risk.

## Temporary decisions

None currently in effect that diverge from the documented architecture. All decisions made this session are treated as final/accepted (see `DECISIONS.md`), not temporary workarounds.

## Next three recommended actions

0. **(Needs the user's decision, not the AI's)** Decide whether to `git add` + `git commit` the 17 untracked documentation files. They are complete and accurate as of this checkpoint but have been deliberately left uncommitted pending explicit instruction — do not commit them unilaterally.
1. **(Optional, not blocking)** Add a minimal test suite. `lib/strategy.ts`, `lib/risk.ts`, and `lib/paper.ts` are pure functions with no I/O — ideal, cheap unit-test targets (e.g., verify `ema()` matches known values, verify `checkKillSwitch` trips at the exact threshold, verify `reconcile()` clamps position size correctly). No test framework is installed; adding one (e.g., Vitest) would be the first step.
2. **(Optional, not blocking)** Run `npm run lint` at least once and address whatever Next's default ESLint config flags — it has never been run this session, so its current pass/fail state is genuinely unknown.
3. **(Optional, not blocking)** Decide whether to keep this app scoped to paper-trading-only forever, or whether real order placement is ever in scope. If real trading is ever considered, treat it as a completely new architecture decision (see `CLAUDE.md` → "Never silently replace an existing architectural pattern") — do not casually bolt real Hyperliquid order calls onto this client-side app, since that would require securely handling a real private key, which this app's entire design (client-only, no secrets, no backend state) is not built for.

## Verification required before continuing any new task

- Run `git status` and `git log --oneline -5` to confirm no one has pushed additional commits since this audit's HEAD (`7df08aa`).
- Run `npm run build` to confirm the build is still clean before making changes.
- If touching `app/globals.css`, re-check all 4 themes visually (or via the same Playwright pattern used this session) before considering the change done — this codebase has a proven history of theme-specific regressions that are invisible if you only check one theme.
