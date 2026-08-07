# TASKS.md — hyperliquid-bot-web

Active execution queue. Keep this file in sync with `PROJECT_STATE.md` and `HANDOFF.md` — the "current task" must match across all three.

---

## Current task

**C-004 — Final transfer checkpoint (fourth documentation pass). Status: Complete as of this writing.**

- **Exact objective:** Independently re-verify the repository's current state, add the one missing canonical doc (`README.md`, repo was at 16/17), re-verify `PROJECT_STATE.md`/`TASKS.md`/`FEATURES.md` against real code/git state, scan for secrets, resolve cross-file contradictions, and refresh `HANDOFF.md`'s resume prompt. No feature work, no application-behavior changes.
- **What has already been completed:**
  1. Confirmed via `ls` the repo had 16/17 canonical docs — `README.md` was genuinely missing. Wrote `README.md` (what the app is, stack, local run instructions, live URL, and a paper-trading-only note independently verified against the code, not just copied from other docs).
  2. Inspected `git status` (clean), `git log --oneline -5` (HEAD `70f4a80`, "docs: add full handoff documentation system"), `git fetch origin` (up to date, nothing new on remote), `git branch -vv`.
  3. Re-ran the paper-trading-only spot-check independently: grepped `app/`+`lib/` for privateKey/signer/placeOrder/wallet/0x-hex identifiers (zero matches), confirmed `package.json` runtime deps are still only `next`/`react`/`react-dom`, confirmed `lib/hyperliquid.ts` only hits the public read-only `https://api.hyperliquid.xyz/info` endpoint.
  4. Ran `npm run build` — clean, 0 errors.
  5. Grepped every tracked file (not just `.md`) for secret-shaped patterns (api_key/secret/password/private_key/bearer/token assignments) — zero matches. Confirmed `.env.local` (untracked, gitignored) contains only a Vercel CLI OIDC JWT, not an application secret, and is not referenced by any doc or app code.
  6. **Found a real cross-file contradiction:** `CLAUDE.md`, `PROJECT_STATE.md`, `TASKS.md`, and `HANDOFF.md` all still stated the 17-file doc set was untracked and awaiting the user's commit decision — but `git log` shows the owner (Gary Wang) already committed all 17 files at `70f4a80`, one commit after the `C-003` pass. Corrected this in all four files.
  7. Refreshed the "Prompt for the next Claude Code account" section in `HANDOFF.md` to reflect current state (docs committed, README added, no open commit decision).
  8. Updated `PROJECT_STATE.md` and this file with this pass's findings; appending to `SESSION_LOG.md`.
- **What remains:** Nothing for this task itself.
- **Relevant files:** `README.md` (new), `CLAUDE.md`, `PROJECT_STATE.md`, `TASKS.md` (this file), `HANDOFF.md`, `SESSION_LOG.md`. `FEATURES.md`/`ARCHITECTURE.md`/`DECISIONS.md`/`SECURITY.md`/`DEPLOYMENT.md` were read and spot-checked against the live code but found accurate — not edited. No application source files were touched.
- **Known errors:** None encountered during this checkpoint.
- **Blockers:** None.
- **Acceptance criteria:**
  - 17/17 canonical docs present (README.md added, was the only gap).
  - The "current task"/"docs committed" statement reads consistently across `CLAUDE.md`, `PROJECT_STATE.md`, `TASKS.md`, and `HANDOFF.md`.
  - No real secret value appears in any tracked file (Verified via grep — clean).
  - `npm run build` re-run and confirmed clean this pass.
  - No application file was modified as part of this checkpoint.
- **Verification steps performed:** `ls` (doc inventory), `git status`, `git log --oneline -5`, `git fetch origin`, `git branch -vv`, `grep -rniE` for order/signing/wallet identifiers across `app/`+`lib/`, `cat package.json` dependency block, `npm run build`, `git grep -nIiE` for secret-shaped patterns across all tracked files, `curl` checks against the live URL (`/` and `/changelog`, both 200).

## Next up

_(Nothing queued/required. The items below are optional improvements, not blockers.)_

- **T-001 — Add a minimal automated test suite.**
  - Status: Not started
  - Priority: Medium
  - Relevant files: `lib/strategy.ts`, `lib/risk.ts`, `lib/paper.ts` (all pure functions, no I/O — cheapest to test)
  - Dependencies: Choosing/installing a test runner (none installed today — Vitest would be a natural fit for a Next.js 15 + TS project, but this is a recommendation, not a repository fact)
  - Acceptance criteria: At minimum, `ema()`/`signal()`/`checkKillSwitch()`/`clampOrderNotional()`/`reconcile()` each have at least one test with a known input/output pair.
  - Validation steps: `npm test` (or whatever script is added) passes; `npm run build` still passes.
  - Notes: Not requested by the user — purely a recommendation based on the fact that the "exact port" guarantee (see `CLAUDE.md`) currently has zero automated protection.

- **T-002 — Decide on an ESLint setup and run it.**
  - Status: Not started (investigated this session — see Notes)
  - Priority: Low
  - Relevant files: whole repo; would add a new `.eslintrc.json`/`eslint.config.mjs` + a devDependency
  - Notes: `npm run lint` was run this session and found to be **not a simple check** — since no ESLint config exists, `next lint` (which is deprecated, slated for removal in Next.js 16) launches an interactive setup wizard and would create a new config file + install a dependency if completed. This was deliberately cancelled rather than completed, since choosing "Strict" vs "Base" and accepting a new dependency is a scope/preference decision. Whoever picks this up should decide: (a) skip ESLint entirely and rely on `tsc`'s type-checking (already happens via `next build`), (b) run the wizard and pick a config, or (c) migrate straight to a flat `eslint.config.mjs` given `next lint`'s deprecation. This is genuinely a decision, not a mechanical task.

## Blocked

_(None.)_

## High priority

_(None open.)_

## Medium priority

- T-001 (see above)

## Low priority

- T-002 (see above)
- Consider adding bounds-checking on the `fast`/`slow`/`band` query params in `app/api/market/route.ts` (currently any parseable number is accepted, including negative or nonsensical values — not known to have caused a problem, but untested at the extremes).

## Bugs

_(None open. All bugs found this session were fixed before handoff — see Recently completed.)_

## Technical debt

- `lib/hyperliquid.ts`'s `fetchUniverseSymbols()` is exported but never called anywhere in the app (Verified via grep). Either wire it up (e.g., to validate/populate the symbol dropdown dynamically instead of the hardcoded `["ETH","BTC","SOL","ARB","DOGE"]` list in `app/page.tsx`) or remove it.
- No test suite (see T-001).
- No ESLint config committed, despite `npm run lint` being a defined script — behavior of that script is currently undefined/unverified.
- Theme-color discipline (every color must be a CSS variable) is enforced only by convention/review, not by tooling. A stylelint rule could catch hardcoded colors automatically, but none is configured.

## Testing needed

- No manual smoke test has been run against `npm run dev` (only `npm run build` + `npm run start` were used this session). Dev-mode-specific issues (if any) are **Unable to verify**.
- Negative/zero/absurd values in the Config panel's numeric inputs are untested.
- Mobile/narrow-viewport behavior below the one `720px` breakpoint has not been screenshot-verified (only a 1280px-wide viewport was captured this session).

## Documentation needed

_(None — this audit just created the full set. Keep it updated per `CLAUDE.md`'s permanent rules going forward.)_

## Recently completed

- **C-004 — Final transfer checkpoint, fourth pass** (2026-08-07, documentation-only): added the missing `README.md` (repo was at 16/17 canonical docs), re-verified paper-trading-only claim and secrets scan independently, ran `npm run build` clean, found and fixed a real contradiction (docs were described as uncommitted in `CLAUDE.md`/`PROJECT_STATE.md`/`TASKS.md`/`HANDOFF.md` after the owner had already committed them at `70f4a80`), refreshed `HANDOFF.md`'s resume prompt. See "Current task" above for the full breakdown.
- **C-003 — Account-switch checkpoint, third pass** (2026-08-06, documentation-only, no commit): independently re-derived repo state from a fresh session, found zero drift since C-002, re-confirmed paper-trading-only via direct code/dependency spot-check, re-confirmed zero secrets in docs. See "Current task" above for the full breakdown.
- **C-002 — Account-switch checkpoint, second pass** (2026-08-06, documentation-only, no commit): re-verified state, refreshed all 17 memory files, added `DECISIONS.md` D-008. See "Current task" above for the full breakdown.
- **C-001 — Account-switch checkpoint, first pass / initial creation of the 17-file memory system** (2026-08-06, documentation-only, no commit): full repository audit, created `CLAUDE.md`/`PROJECT_STATE.md`/`ARCHITECTURE.md`/`FILE_MAP.md`/`FEATURES.md`/`TASKS.md`/`ROADMAP.md`/`DECISIONS.md`/`DATABASE.md`/`API_REFERENCE.md`/`UI_SYSTEM.md`/`SECURITY.md`/`TESTING.md`/`DEPLOYMENT.md`/`CHANGELOG.md`/`SESSION_LOG.md`/`HANDOFF.md` from scratch.
- **Fixed cross-theme color leaks** (commit `7df08aa`, 2026-08-05/06): chart tooltip contrast bug in light theme; hardcoded blue accents bleeding into Matrix/Midnight themes. Verified via fresh Playwright screenshots post-deploy.
- **Added 4-theme wheel + real PNG backgrounds + real app icon** (commits `7584a85`, `b7591f3`, `bf22f2c`): replaced a 2-way light/dark slider with a 4-swatch picker (Terminal/Paper/Matrix/Midnight), generated real background PNGs per theme via a standalone Python/Pillow script, added `app/icon.png` as a real favicon.
- **Fixed background-overlay-too-strong bug** (part of the above): `--bg-overlay` was 0.5–0.62, making the background PNG nearly invisible; corrected to ~0.22–0.35 and boosted the PNGs' own glow intensity.
- **Redesigned as a trading-terminal dashboard** (commit `7def59a`): added the live EMA sparkline chart, position meter, glassy stat cards, color-coded log lines.
- **Initial build** (commit `4f8c41c`): ported the Python bot's strategy/risk/paper-fill logic to TypeScript, built the polling dashboard, deployed to Vercel.

## Deferred

_(None explicitly deferred — see Next up for optional, non-blocking ideas.)_

## Rejected ideas

- Adding decorative "light beam" shapes to a dark background PNG — tried (in the sibling `sports-betting-web` repo's shared generator script, not this repo directly) and explicitly rejected as looking bad ("flat solid triangles, not actual light"). Recorded here because the same generator pattern applies if this repo's backgrounds are ever regenerated — don't reintroduce that specific effect.
