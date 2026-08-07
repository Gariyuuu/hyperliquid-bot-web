# CLAUDE.md — Operating Manual for hyperliquid-bot-web

> Read this file first, every session, before touching code. It is the primary source of truth for this repository. Also read `PROJECT_STATE.md` and `TASKS.md` immediately after.

Audit performed: 2026-08-06, most recently refreshed 2026-08-07 (fourth checkpoint, task `C-04`, a "final transfer" pass — see `PROJECT_STATE.md`). All claims below are **Verified** against the repository at commit `70f4a80` on `main` (application code unchanged since `7df08aa`; only documentation commits have landed since) unless explicitly marked **Inferred** or **Unknown**.

---

## Project identity

- **Name:** hyperliquid-bot-web
- **One-sentence description:** A read-only, paper-trading web dashboard that mirrors the EMA-crossover trading strategy of a separate Python bot (`~/Projects/hyperliquid-bot`), running against live public Hyperliquid market data with a simulated account — no real money, no exchange keys.
- **Detailed summary:** This app is a from-scratch Next.js port of the *strategy logic* of `hyperliquid-bot` (a Python CLI trading bot). It is **not** a lift of the Python code — TypeScript re-implementations of the EMA signal, risk/kill-switch rules, and paper-fill simulator live in `lib/`. The app polls live Hyperliquid price/candle data through its own API route, computes the same EMA(9/21) crossover signal the Python bot uses, and runs a client-side paper-trading simulation (starting balance $1,000) so a user can watch the strategy's behavior without any financial risk. It was built as a "Vercel version" of the bot specifically so its owner (also the owner of the Python bot) could see the strategy running live in a browser instead of a terminal.
- **Target audience:** Solo hobbyist (repository owner). Not built for multi-tenant public use, though it is deployed publicly.
- **Main user problem solved:** "I want to see my EMA trading bot's signal and behavior live, in a nice UI, without running the Python CLI and without risking real funds."
- **Current development stage:** Working prototype / demo. Polished UI, no automated tests, no database, single-developer project. Not production software in the SaaS sense — but it *is* deployed and publicly reachable.
- **Production status:** **Live** at https://hyperliquid-bot-web-alpha.vercel.app (Verified — returns HTTP 200 as of audit). Deployed via Vercel, connected to GitHub `Gariyuuu/hyperliquid-bot-web` for auto-deploy on push to `main` (Inferred from `vercel link` output during setup; not independently re-verified this session).
- **Repository type:** Single Next.js App Router application. Not a monorepo. No workspaces.

### Relationship to sibling project
`~/Projects/hyperliquid-bot` is a **separate, unrelated git repository** — a pure Python CLI (no web server) that this app's strategy logic was ported from. Changes to the Python bot do **not** automatically apply here; `lib/strategy.ts`, `lib/risk.ts`, and `lib/paper.ts` are hand-ported TypeScript mirrors and must be updated manually if the Python originals change. There is no shared code, build step, or dependency between the two repos.

---

## Current status

- **Current stable state:** Deployed, working, verified via live HTTP checks and Playwright screenshots across all 4 themes (2026-08-06 audit). No known bugs open.
- **Latest completed milestone:** v0.4.0 — 4-theme wheel (Terminal/Paper/Matrix/Midnight), real PNG backgrounds per theme, real app icon/favicon, cross-theme color-consistency fixes (chart tooltip contrast bug and hardcoded-gold-in-non-gold-themes bug, both fixed in commit `7df08aa`).
- **Current active task:** None (application-wise). Task `C-004` (a fourth account-switch/"final transfer" documentation checkpoint) is complete as of this writing — see `TASKS.md`/`PROJECT_STATE.md`. The 17-file documentation set (plus the previously-missing `README.md`, now added) is fully committed at `70f4a80` and this checkpoint's commit; no open commit decision remains.
- **Blockers:** None known.
- **Highest-priority next task:** None queued. See `TASKS.md` "Next up" for optional follow-ups (mainly: no automated tests exist; consider adding at least a smoke test for `lib/strategy.ts` and `lib/paper.ts` since they are pure functions and easy to unit-test).
- **Features currently under construction:** None.

---

## Technology stack

All versions below are **Verified** from `package.json` / `package-lock.json` (resolved versions) as of this audit. Do not upgrade without checking `package-lock.json` again — do not assume these numbers stay current.

| Category | Technology | Version (resolved) |
|---|---|---|
| Language | TypeScript | 5.9.3 (devDependency range `^5.7.0`) |
| Framework | Next.js (App Router) | 15.5.22 (range `^15.1.0`) |
| UI library | React | 19.2.8 (range `^19.0.0`) |
| UI library | React DOM | 19.2.8 (range `^19.0.0`) |
| Package manager | npm | Verified via `package-lock.json` (lockfileVersion present); no `pnpm-lock.yaml` or `yarn.lock` present |
| Runtime | Node.js | Built/tested under Node v26.3.0 on the dev machine (Inferred from environment, not pinned in repo — no `.nvmrc` or `engines` field exists) |
| Styling | Plain CSS (`app/globals.css`), no CSS framework | — |
| Database | **None.** No ORM, no schema, no migrations. | N/A |
| Auth provider | **None.** No login system in this app. | N/A |
| Storage provider | **None.** All state is browser `localStorage`. | N/A |
| Hosting | Vercel | Project `garywangsmes-8349s-projects/hyperliquid-bot-web` (Verified via `vercel` CLI output during deploys) |
| Analytics | **None detected.** | N/A |
| Payments | **None.** | N/A |
| Email | **None.** | N/A |
| Testing libraries | **None installed.** No test runner in `package.json`. | N/A |
| Build tool | Next.js built-in (`next build`, Turbopack/webpack as configured by Next 15 defaults) | — |
| Linting | `next lint` script exists in `package.json`, but **no ESLint config file exists in the repo** (Verified: no `.eslintrc*` or `eslint.config.*` found). **Verified this session:** running `npm run lint` does NOT just run a check — `next lint` is deprecated (removal planned in Next.js 16) and, with no config present, launches an **interactive first-run wizard** prompting you to choose "Strict"/"Base"/"Cancel" and will create a new ESLint config file + install a dependency if you proceed. It was intentionally cancelled without selecting an option during this audit, since creating that config is a scope decision, not a simple verification step. | — |
| Formatting | **No Prettier config detected.** | N/A |
| External APIs | Hyperliquid public Info API (`https://api.hyperliquid.xyz/info`) — public, unauthenticated, read-only. No API key required or used. | — |

---

## Essential commands

Single app, single working directory — always run from the repo root (`~/Projects/hyperliquid-bot-web`). **Verified** = actually run this session and confirmed working; **Documented-only** = present in `package.json` but not re-run during this audit.

| Purpose | Command | Status |
|---|---|---|
| Install dependencies | `npm install` | Verified (run multiple times this session) |
| Run dev server | `npm run dev` | Documented-only (not run this session; used `npm run start` against a production build instead) |
| Build for production | `npm run build` | Verified — builds clean, 0 errors, as of commit `7df08aa` |
| Start production server locally | `npm run start -- -p <port>` | Verified — used repeatedly for local smoke tests |
| Lint | `npm run lint` | **Verified this session it does NOT run cleanly non-interactively** — see Linting row above. Do not run unattended (e.g., in a script) without first deciding whether to accept ESLint config creation. |
| Type-check | No standalone `tsc --noEmit` script exists; type errors surface during `npm run build` (Next.js runs its own type check as part of build) | Verified indirectly (build includes "Linting and checking validity of types ..." step) |
| Unit tests | **No test script exists.** | N/A |
| Integration/E2E tests | **None exist.** | N/A |
| Database migration/seed | N/A — no database | N/A |
| Generate types | N/A — no codegen step | N/A |
| Reset local dev data | Clear browser `localStorage` key `hlbot-web-state-v1` (or open in a private window) | Verified by inspection of `app/page.tsx` |
| Deploy | `vercel --prod --yes` (requires Vercel CLI logged in as the account that owns the linked project) | Verified — used for every deploy this session |
| Link a fresh checkout to the existing Vercel project | `vercel link` (will prompt/auto-detect the existing `garywangsmes-8349s-projects/hyperliquid-bot-web` project if run by the same Vercel account) | Verified once during initial setup |
| Set an env var on Vercel | `printf '%s' 'value' \| vercel env add VAR_NAME production` | Verified (used for a different repo this session; same pattern applies) |

No `.env` variables are required for local dev — the app has zero required environment variables (see Environment setup below).

---

## Repository structure

```
hyperliquid-bot-web/
├── app/                     Next.js App Router root
│   ├── layout.tsx           Root HTML layout + no-flash theme-init inline script
│   ├── page.tsx             The entire dashboard UI (client component) — single page app
│   ├── globals.css          All styling: theme variables (4 themes), components, layout
│   ├── PriceChart.tsx        Inline SVG price+EMA chart component (client)
│   ├── ThemeWheel.tsx        4-swatch theme picker component (client)
│   ├── icon.png             App icon — Next.js auto-detects this as the favicon
│   ├── api/market/route.ts  The only API route: GET, fetches live Hyperliquid data + computes signal
│   └── changelog/page.tsx   Static patch-notes page
├── lib/                     Pure TypeScript logic, framework-agnostic
│   ├── strategy.ts          EMA + crossover signal (ported from Python strategy.py)
│   ├── risk.ts              Position clamp, min-order filter, kill-switch (ported from risk.py)
│   ├── paper.ts             Paper-trading simulator + reconcile loop (ported from hl_client.py + bot.py)
│   └── hyperliquid.ts       Server-side fetch helpers for the public Hyperliquid Info API
├── public/                  Static assets served at site root
│   ├── bg-dark.png          Terminal theme background (default)
│   ├── bg-light.png         Paper theme background
│   ├── bg-matrix.png        Matrix theme background
│   └── bg-violet.png        Midnight theme background
├── package.json / package-lock.json
├── tsconfig.json            Path alias: `@/*` → repo root (so `@/lib/...` resolves to `lib/...`)
├── next.config.ts           Empty/default Next config
└── .env.local               Vercel CLI metadata only (VERCEL_OIDC_TOKEN) — gitignored, not a real secret
```

**What belongs where:**
- Any new pure logic (math, formulas, data transforms) → `lib/`, as a framework-agnostic `.ts` file with no React/Next imports. This keeps it testable and matches the existing pattern.
- Any new UI → new component file directly under `app/` (this project does not use an `app/components/` subfolder convention — `PriceChart.tsx` and `ThemeWheel.tsx` sit directly in `app/`).
- Any new server-only fetch/integration code → `lib/` (see `hyperliquid.ts` pattern) and called from an `app/api/*/route.ts` handler, never called directly from a client component (keeps API keys/server-only fetches off the client bundle — though this app currently has no secrets to protect).
- Nothing should be placed in `app/api/` except `route.ts` files following Next.js route-handler conventions.

**Entry points:** `app/page.tsx` is the only real page. `app/layout.tsx` wraps everything. `app/api/market/route.ts` is the only backend entry point.

---

## Architecture summary

See `ARCHITECTURE.md` for the full diagram and flow descriptions. Summary:

- **Frontend architecture:** Single client component (`app/page.tsx`, `"use client"`) holding all state via `useState`/`useEffect`. No global state library, no context providers beyond the DOM `data-theme` attribute. State persists to `localStorage` (key `hlbot-web-state-v1`).
- **Backend architecture:** One Next.js Route Handler (`app/api/market/route.ts`), stateless, no auth, calls the public Hyperliquid Info API server-side and returns computed signal data as JSON. `dynamic = "force-dynamic"` — never cached.
- **Request flow:** Browser timer (`setInterval`, driven by the `pollSeconds` config) → `fetch('/api/market?...')` → route handler → Hyperliquid public API → response → client updates React state → client runs `lib/paper.ts` `reconcile()` locally → UI re-renders → `localStorage` write.
- **Rendering strategy:** Everything under `app/page.tsx` is client-rendered (`"use client"`). `app/changelog/page.tsx` is a plain server component (static, no data fetching).
- **Server/client boundary:** Only `app/api/market/route.ts` runs server-side per-request. Everything else in `app/` that fetches data does so via `fetch()` from the client to that one route.
- **State management:** Plain React `useState` + `localStorage`. No Redux/Zustand/Context.
- **Database access pattern:** N/A — no database.
- **Authentication flow:** N/A — no auth.
- **Authorization flow:** N/A.
- **Storage flow:** Browser `localStorage` only, one JSON blob under key `hlbot-web-state-v1` containing `{ config, paper, logLines }`.
- **External integration flow:** `app/api/market/route.ts` → `lib/hyperliquid.ts` → `POST https://api.hyperliquid.xyz/info` (public, unauthenticated, mainnet, read-only market data — `allMids` and `candleSnapshot` request types).
- **Background/scheduled processing:** None server-side. The only "background" behavior is a client-side `setInterval` while the dashboard tab is open and the user has pressed Start.
- **Caching:** Explicitly disabled (`cache: "no-store"` on the client fetch, `dynamic = "force-dynamic"` on the route, `cache: "no-store"` on the upstream Hyperliquid fetch).
- **Error handling:** Route handler wraps in try/catch, returns `{ error }` JSON with 404/502 status. Client shows errors inline in the activity log panel, prefixed and styled red.
- **Logging:** No server-side logging beyond default Vercel function logs. Client "logging" is the in-UI activity log (not sent anywhere).
- **Deployment architecture:** Vercel, Next.js default serverless function for the one API route, static/edge-rendered pages for the rest.

---

## Coding conventions

All **Verified** by inspection of the existing (small) codebase — there is no separate style guide, these are simply the patterns actually used:

- **Naming:** camelCase for functions/variables, PascalCase for components and types/interfaces. File names match their default export (`PriceChart.tsx` exports `PriceChart`).
- **File organization:** Flat. No barrel files (`index.ts`), no deep nesting. `lib/` files are single-purpose and named after what they compute (`strategy.ts`, `risk.ts`, `paper.ts`).
- **Imports:** Absolute imports via the `@/` alias (`@/lib/strategy`) defined in `tsconfig.json`, preferred over relative `../../` paths for anything outside the same folder. Same-folder imports use `./`.
- **Components:** Function components only, no classes. Client components explicitly marked `"use client"` at the top of the file. Props typed via a local `interface Props` or inline destructured type.
- **Hooks:** Standard React hooks only (`useState`, `useEffect`, `useRef`, `useMemo`). No custom hooks currently exist — if adding shared stateful logic used in 2+ places, a `useXxx` custom hook would be the idiomatic next step, but none exists yet as precedent.
- **API routes:** One file per route (`route.ts`), export named `GET`/`POST` async functions, use `NextRequest`/`NextResponse`, always wrap logic in try/catch and return JSON with an explicit status code on error.
- **Services:** Server-side integration code (`lib/hyperliquid.ts`) exports plain async functions, no classes.
- **Validation:** Minimal — query params are parsed with fallback defaults (`params.get("symbol") ?? "ETH"`), no schema validation library (no Zod/Yup). **Inferred recommendation, not yet done:** if this route is extended, consider adding basic bounds-checking on numeric params (e.g., `fast`/`slow` could currently be any parseable integer including negative or absurd values — see Known issues).
- **Types:** Explicit interfaces for all non-trivial shapes (`Config`, `PaperState`, `ReconcileConfig`, `ReconcileResult`, `LogLine`). Signal is a literal union type `-1 | 0 | 1` named `Signal`.
- **Styling:** One global `app/globals.css` file, BEM-ish flat class names (`.hero-price`, `.chart-tooltip`), CSS custom properties for all theme-dependent colors (never hardcode a color that should vary by theme — see Known issues for two bugs this exact mistake caused, both now fixed).
- **Error handling:** try/catch at the boundary (API route, client fetch), errors surfaced as data (`{ error: string }`) rather than thrown across boundaries.
- **Async logic:** `async`/`await` throughout, no raw `.then()` chains.
- **Comments:** Sparse, used only to explain *why* (e.g., "// Mirrors hl_client.py recent_closes(n)..."), not *what*. This matches the file-header comments in `lib/paper.ts` and `lib/strategy.ts` explicitly noting they are ports of specific Python functions — preserve these provenance comments if you touch that logic, they're load-bearing documentation.
- **Tests:** None exist. No convention established.

---

## UI and design system

Full detail in `UI_SYSTEM.md`. Key facts:

- **Design style:** Dark-first "trading terminal" aesthetic with 4 selectable themes.
- **Theme system:** Implemented via `[data-theme]` attribute on `<html>`, set by an inline `<script>` in `app/layout.tsx` (reads `localStorage.getItem("hlbot-theme")` before hydration to avoid a flash of the wrong theme), and changed at runtime by `app/ThemeWheel.tsx`. Themes are defined as CSS variable blocks in `app/globals.css`:
  - `:root` / `:root[data-theme="dark"]` → **Terminal** (default): near-black, blue/green glow, `bg-dark.png`
  - `:root[data-theme="light"]` → **Paper**: near-solid white, `bg-light.png`
  - `:root[data-theme="matrix"]` → **Matrix**: black/green hacker-terminal, `bg-matrix.png`
  - `:root[data-theme="violet"]` → **Midnight**: purple/magenta, `bg-violet.png`
- **Colors:** All theme colors are CSS custom properties (`--text`, `--muted`, `--long`/`--long-bright`, `--short`/`--short-bright`, `--blue`, `--orange`, `--gold`... see `app/globals.css` lines 1–~135 for the full variable catalogue per theme). **Rule:** any new colored UI element must reference a `var(--...)`, never a literal hex/rgb — two real bugs this session were caused by literal colors not following the active theme (see Known issues).
- **Typography:** System font stack (`-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`), no custom webfont. `font-variant-numeric: tabular-nums` used throughout for aligned numeric columns (prices, stats).
- **Background image system:** Each theme has a real PNG at `public/bg-{theme}.png`, applied via `body::before` (`background-image`, `background-size: cover`, `background-position: center top`, `position: fixed`) with a `body::after` translucent color-wash overlay (`--bg-overlay`, ~22% opacity) on top for text legibility. **Do not raise `--bg-overlay` back toward 0.5+** — an earlier version did this and the user explicitly flagged it as "barely a fade, not a png" (see `DECISIONS.md`).
- **Spacing/radius/shadows:** No formal design-token scale (no `--space-1` etc.) — values are ad hoc but consistent-by-convention (`border-radius: 12–16px` for panels, `8–9px` for controls, `999px` for pills/buttons-as-pills).
- **Breakpoints:** One breakpoint, `@media (max-width: 720px)`, used only to collapse the `.hero` grid to a single column.
- **Animations:** One keyframe (`@keyframes pulse`), used for the live-status dot and the "running" pill indicator.
- **Reusable components:** `PriceChart` (chart), `ThemeWheel` (theme picker). No component library — everything else is plain HTML elements styled via class names, no shared `Button`/`Card` components abstracted out (every button/card is hand-styled inline via className).
- **Icon system:** One emoji used inline (🔥 on the "Crazy mode" button). The favicon/app icon (`app/icon.png`) is a procedurally-generated PNG (5-bar rising candlestick glyph), not an icon font/SVG library.
- **Accessibility:** `ThemeWheel` swatches use `role="radio"`/`role="radiogroup"` and `aria-checked`. No other explicit ARIA authoring detected. Not tested with a screen reader (**Unknown** whether it's usable with one).
- **Responsive design:** Functional but minimal — only the one breakpoint above; the config grid and stat grid use `repeat(auto-fit, minmax(...))` which reflows naturally without explicit breakpoints.

Theme/design-token file: **`app/globals.css`** (single file, ~600 lines as of audit) — this is the only place theme variables are defined.

---

## Environment setup

**This application requires zero environment variables to run**, locally or in production. This is Verified by inspection of every source file — no `process.env.*` reference exists anywhere in `app/` or `lib/`.

`.env.local` exists in the working directory but contains only Vercel CLI metadata (`VERCEL_OIDC_TOKEN`), auto-generated by `vercel link`, gitignored, and not read by application code. There is no `.env.example` in this repo and none is needed — creating one with zero entries would be accurate but is not required.

If a future task adds a real external API key (e.g., switching from Hyperliquid mainnet to an authenticated endpoint), add it here and to `.env.example`, following the pattern already used in the sibling `sports-betting-web` repo (`ODDS_API_KEY`, `SITE_PASSWORD`) as a template for how this account sets Vercel env vars (`vercel env add`).

---

## Database summary

**Not applicable.** This application has no database, no ORM, no schema, no migrations, and no seed data. All persisted state is a single JSON blob in the browser's `localStorage` (see Architecture summary). If a future task needs cross-device or multi-user persistence, that would be a new architectural addition, not an extension of anything currently present — flag it in `DECISIONS.md` before starting.

---

## Authentication and authorization

**Not applicable.** There is no login, no session, no user accounts, no roles, and no protected routes. The single API route (`/api/market`) is fully public and unauthenticated — this is intentional (it only proxies public, read-only Hyperliquid market data with no secret involved) and should stay that way unless the app's purpose changes.

---

## API and integrations

Full detail in `API_REFERENCE.md`. Summary:

- **Internal endpoints:** One — `GET /api/market`.
- **External APIs:** One — Hyperliquid public Info API (`https://api.hyperliquid.xyz/info`), called server-side from `lib/hyperliquid.ts`. Public, unauthenticated, mainnet, read-only (`allMids`, `candleSnapshot` request types). No SDK used — raw `fetch()`.
- **Webhooks:** None.
- **Service accounts:** None.
- **Rate limits:** Not documented by Hyperliquid in a way this codebase accounts for — there is no retry/backoff logic. If Hyperliquid rate-limits or errors, the route returns a 502 and the client logs the error; the UI will simply show stale/no data until the next poll tick.
- **Integration-specific env vars:** None — the Hyperliquid Info API requires no key.

---

## Testing and verification

Documented fully in `TESTING.md`. Summary: **no automated tests exist.** Verification this session was manual: `npm run build` (clean), local `npm run start` + `curl` checks, and Playwright screenshots across all 4 themes on the live Vercel deployment. See `TESTING.md` for the manual smoke-test checklist to re-run after any change.

---

## Deployment

Documented fully in `DEPLOYMENT.md`. Summary: Vercel, project `garywangsmes-8349s-projects/hyperliquid-bot-web`, deployed via `vercel --prod --yes` from this directory, connected to GitHub `Gariyuuu/hyperliquid-bot-web` on `main`. Build command `next build` (Vercel default, not overridden). No environment variables required. No database migrations to run. No custom domain configured beyond the default `*.vercel.app` URL (**Verified** — only the default Vercel URL has been used all session; **Unknown** whether a custom domain was configured outside this session's visibility).

---

## DO NOT CHANGE WITHOUT REVIEW

- **`lib/strategy.ts`, `lib/risk.ts`, `lib/paper.ts`** — these are deliberate, verified ports of the Python bot's exact math (EMA seeding, kill-switch threshold, fee/slippage constants). Silently "improving" the math here breaks the entire premise of the app (mirroring the real bot). Any change to the formulas must be cross-checked against the Python source in `~/Projects/hyperliquid-bot` and called out explicitly.
- **The `--bg-overlay` CSS variable values in `app/globals.css`** — there is a documented history (see `DECISIONS.md`) of this being set too high (0.5–0.62) and the user explicitly rejecting it as making the background PNG invisible. Current values (~0.22–0.35) are the corrected, accepted state. Don't regress this without a specific reason.
- **Any hardcoded `rgba(...)`/hex color in `app/globals.css` outside a `:root[data-theme="..."]` block** — this exact mistake caused two real, shipped bugs this session (gold-tinted UI staying gold in non-gold themes; a chart tooltip with a hardcoded dark background becoming illegible in the light theme). Every color must route through a `var(--...)` that's redefined per theme, or use `color-mix(in srgb, var(--x) N%, transparent)` for tinted variants.
- **`app/api/market/route.ts`'s `dynamic = "force-dynamic"` export** — removing this could let Next.js cache stale market data.
- **The Hyperliquid API base URL in `lib/hyperliquid.ts`** — it currently points at mainnet. Do not silently point this at testnet or vice versa; either is a meaningful behavior change for anyone reading live prices off this dashboard.

---

## Known issues

See `PROJECT_STATE.md` and `TASKS.md` for the live/current list. As of this audit: **no open known issues.** Two issues were found and fixed *during* this session's development (not currently open):
1. Background overlay too strong, PNG barely visible → fixed by lowering `--bg-overlay` and boosting glow intensity in the generated PNGs (commit `7584a85`).
2. Cross-theme hardcoded colors (chart tooltip contrast, button/dot glow colors) → fixed via `color-mix()` (commit `7df08aa`).

---

## Account-switch checkpoints

This repository has three times been the subject of an explicit "prepare for account switch" request (2026-08-06, see `SESSION_LOG.md` — `C-001`, `C-002`, `C-003`). If asked again to perform a full documentation audit / account-switch checkpoint, the expected deliverable is:

1. Inspect current branch, `git status`, recent commits, uncommitted/untracked files.
2. Update `PROJECT_STATE.md` with the exact current state.
3. Update `TASKS.md`'s current task with: exact objective, what's completed, what remains, relevant files, known errors, blockers, acceptance criteria, verification steps.
4. Update `HANDOFF.md` with the exact resume point.
5. Append (never overwrite) a new dated entry to `SESSION_LOG.md`.
6. Update this file (`CLAUDE.md`) if any new architecture/workflow/restriction/convention emerged.
7. Update any other affected doc (`ARCHITECTURE.md`, `FEATURES.md`, `DECISIONS.md`, `SECURITY.md`, etc.).
8. **Search the live conversation (not just the code) for decisions, rejected ideas, requirements, and warnings that are not discoverable from the code alone** — e.g., this repo's `DECISIONS.md` D-008 (why specific chart colors were picked from a validated colorblind-safe palette) exists only because it was recorded during exactly this kind of checkpoint, not because the code itself reveals the *why*.
9. Grep for secret values before finishing — this has caught a real accidental leak once already (see `SESSION_LOG.md`'s sibling-repo entry).
10. Verify the "current task" statement is word-for-word consistent across `CLAUDE.md`, `PROJECT_STATE.md`, `TASKS.md`, `HANDOFF.md`.
11. Do not commit, push, deploy, reset, or change application behavior as part of a checkpoint unless explicitly told to.

## AI working instructions

1. Read `CLAUDE.md` (this file).
2. Read `PROJECT_STATE.md`.
3. Read `TASKS.md`.
4. Read whichever of `ARCHITECTURE.md` / `FEATURES.md` / `API_REFERENCE.md` / `UI_SYSTEM.md` is relevant to the task at hand.
5. Inspect the affected code before changing it — this is a small codebase, actually open the file, don't assume from this doc alone.
6. Check `git status` before modifying files.
7. Avoid overwriting unrelated work.
8. Make small, reviewable changes.
9. Run `npm run build` after changes (there is no test suite — the build's type-check is the main automated safety net).
10. Update documentation after meaningful changes (see the Permanent rules section below).
11. Never claim something works without verification (build it, run it, or explicitly say "not verified").
12. Never expose secrets — moot for this repo today (there are none), but stays true if any are added later.
13. Never modify production data without explicit permission — moot today (no database), but the deployed Vercel project and its env vars count as "production" for this purpose.
14. Never perform destructive database operations without explicit permission — N/A, no database.
15. Never silently replace an existing architectural pattern with a new one (e.g., don't introduce Redux, a database, or a component library without discussing it — this app is deliberately minimal).
16. Never remove a dependency without checking all usages (`grep -r` first).
17. Never change deployment configuration, or the strategy math in `lib/strategy.ts`/`lib/risk.ts`/`lib/paper.ts`, casually.
18. Record unresolved uncertainty in `PROJECT_STATE.md` rather than guessing.

### Permanent rules — after every meaningful coding task

1. Update `PROJECT_STATE.md`.
2. Update `TASKS.md`.
3. Append to `SESSION_LOG.md` (never overwrite prior entries).
4. Update affected feature/architecture/API/UI/security/testing/deployment docs.
5. Remove or correct stale information you find.
6. Record meaningful architectural decisions in `DECISIONS.md`.
7. Run `npm run build` at minimum.
8. Clearly record anything not verified.
9. Keep this repository as the permanent source of project memory — do not let context live only in chat.

### Permanent rules — before every meaningful coding task

1. Read `CLAUDE.md`.
2. Read `PROJECT_STATE.md`.
3. Read `TASKS.md`.
4. Read the relevant technical documentation file(s).
5. Inspect `git status`.
6. Inspect the files that will be changed.
7. Confirm the requested work hasn't already been done.
8. Preserve unrelated work.
9. Identify risks before modifying anything listed under "DO NOT CHANGE WITHOUT REVIEW".
