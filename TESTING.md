# TESTING.md — hyperliquid-bot-web

## Test frameworks

**None installed.** No test runner appears in `package.json` dependencies or devDependencies (Verified).

## Test directory structure

None exists.

## Unit / integration / E2E tests

None exist.

## Manual testing performed this session (Verified — actually run)

1. `npm run build` — clean, 0 errors, at commit `7df08aa`.
2. `npm run start -- -p 3411` + `curl` against `/`, `/changelog`, `/bg-*.png`, `/api/market?...` — all returned expected status codes and content types.
3. Live deployment (`https://hyperliquid-bot-web-alpha.vercel.app`) checked the same way after each deploy.
4. Playwright screenshots (using a scratch script, not committed to this repo) captured all 4 themes on the live deployment and were visually reviewed — confirmed correct, distinct rendering with no contrast/color-leak bugs after the fixes in commit `7df08aa`.

## Test data / fixtures / mocks

None — every test performed this session hit the real, live Hyperliquid API and the real, live deployment. There is no mocked data path.

## Test environment variables

None needed (app requires zero env vars).

## Coverage gaps (Unable to verify / not tested)

- `npm run dev` (dev-mode-specific behavior) was never run this session — only production build + start.
- `npm run lint` was run once during the documentation audit and found to launch an interactive ESLint setup wizard (no config exists yet) rather than performing a simple check — see `CLAUDE.md`/`TASKS.md` T-002. It was intentionally cancelled rather than completed. Actual lint pass/fail status remains unknown until someone deliberately sets up a config.
- Negative/zero/extreme numeric inputs in the Config panel (e.g., negative `maxPositionUsd`) — untested.
- Behavior below the 720px responsive breakpoint — untested/unscreenshotted.
- Multi-minute continuous operation (does the poll loop leak memory, does the log array's `.slice(-200)` cap actually prevent unbounded growth over a long session) — the cap exists in code (`setLogLines((prev) => [...prev.slice(-200), ...])`) but was not stress-tested over a long real session.
- Screen-reader/accessibility testing — not performed.
- `npm audit`'s specific "3 high severity vulnerabilities" finding was not individually investigated (see `SECURITY.md`).

## Critical untested flows

- Kill-switch trip in "Normal" and "Fast" mode presets (only "Crazy" mode, which is specifically designed to trip it fast, was practically likely to be observed — **Unable to verify** whether Normal/Fast mode kill-switch behavior was specifically exercised this session).

## Known flaky tests

None — there are no automated tests to be flaky.

## Manual smoke-test checklist (run this after any change)

1. `npm run build` — must complete with 0 errors.
2. `npm run start -- -p <port>` — visit `http://localhost:<port>/`, confirm the page loads and shows a live price within a few seconds of pressing Start.
3. Click each of the 4 theme swatches — confirm the background image, panel colors, and text all visibly change and remain legible in every theme.
4. Click "Normal mode", "Fast mode", "Crazy mode" — confirm the Config panel's numeric fields update to the expected preset values.
5. Press Start — confirm the price, gap, and signal pill update on the next poll tick; confirm a line appears in the activity log.
6. Press Stop, then Reset paper account — confirm equity resets to $1,000.00 and the log clears.
7. Visit `/changelog` via the "Patch notes" link — confirm it loads and the "← Back to dashboard" link returns to `/`.
8. Reload the page after changing the theme and starting the bot — confirm the theme and paper-account state both persist (localStorage working).
9. Check `/bg-dark.png`, `/bg-light.png`, `/bg-matrix.png`, `/bg-violet.png`, `/icon.png` all return 200.

## Pre-deployment checks

Same as the smoke-test checklist above, run once locally (`npm run start`) before pushing, and once again against the live URL after `vercel --prod --yes` completes.
