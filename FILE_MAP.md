# FILE_MAP.md — hyperliquid-bot-web

Every file in the repository (excluding `node_modules`, `.next`, `.vercel`, `.git`, lockfiles, and generated `next-env.d.ts`) is listed below. All paths **Verified** to exist at commit `7df08aa`.

| Path | Purpose | Imports / calls | Imported / called by | Edit when | Risk |
|---|---|---|---|---|---|
| `app/layout.tsx` | Root HTML layout; no-flash theme-init inline script | `./globals.css` | Next.js (root layout convention) | Adding global `<head>` tags, changing default theme fallback | Low, but the inline script's `valid` theme-key array must stay in sync with `ThemeWheel.tsx`'s `THEMES` array and `globals.css`'s theme blocks |
| `app/page.tsx` | The entire dashboard UI + all app state + poll loop | `@/lib/paper`, `@/lib/strategy` (type only), `./PriceChart`, `./ThemeWheel`, `next/link` | Next.js (root page convention) | Any UI change, new config field, new stat, new preset | Medium — this file is the app; changes here are changes to the product. Preserve the `localStorage` shape or write a migration if changing `Config`/`PaperState` shape (old saved state would otherwise silently mismatch) |
| `app/PriceChart.tsx` | SVG chart: price line + fast/slow EMA lines + hover tooltip | `@/lib/strategy` (`emaSeries`) | `app/page.tsx` | Chart visuals, tooltip behavior, hover interaction | Low — self-contained, but keep in mind `page.tsx` passes `closes`/`fast`/`slow` directly from live config |
| `app/ThemeWheel.tsx` | 4-swatch theme picker | none (reads/writes `document.documentElement` + `localStorage` directly) | `app/page.tsx` | Adding/removing a theme option | Low, but must stay in sync with `globals.css` theme blocks and `layout.tsx`'s inline script `valid` array — see `DECISIONS.md` D-004 |
| `app/globals.css` | All styling: 4 theme variable blocks + every component class | `public/bg-*.png` (via `url(...)`) | Every component (global stylesheet, imported once in `layout.tsx`) | Any visual change | **High** — this is where both real shipped bugs this session originated (hardcoded colors ignoring theme). Any new color MUST be a `var(--...)` defined in all 4 `:root[data-theme=...]` blocks, or use `color-mix()` against one that is |
| `app/icon.png` | App icon / favicon source | — | Auto-detected by Next.js App Router convention | Rebranding | Low |
| `app/api/market/route.ts` | The only backend endpoint — fetches live data + computes signal | `@/lib/hyperliquid`, `@/lib/strategy` | `app/page.tsx` (via `fetch('/api/market?...')`) | Adding query params, changing response shape, adding caching, adding auth | Medium — changing the response JSON shape breaks the client without a corresponding `page.tsx` update |
| `app/changelog/page.tsx` | Static patch-notes page | `next/link` | Linked from `app/page.tsx` header | Adding a new version entry after a real change | Low |
| `lib/strategy.ts` | EMA + EMA-series + crossover signal (ported from Python `strategy.py`) | none | `app/api/market/route.ts`, `app/page.tsx` (type), `app/PriceChart.tsx`, `lib/paper.ts` (type) | **Only if the Python bot's strategy math changes and you deliberately want to re-sync** | **High** — this is the "exact port" contract. Any change must be justified against the Python source and noted in `DECISIONS.md` |
| `lib/risk.ts` | Position clamp, min-order filter, kill-switch (ported from Python `risk.py`) | none | `lib/paper.ts` | Same as above | **High** — same reasoning |
| `lib/paper.ts` | Paper-trading fill simulator + `reconcile()` loop (ported from Python `hl_client.py` PaperBook + `bot.py` reconcile) | `./risk`, `./strategy` (type) | `app/page.tsx` | Same as above | **High** — same reasoning; also the one place fee (0.045%) and slippage (0.05%) constants live |
| `lib/hyperliquid.ts` | Server-side fetch wrapper for the public Hyperliquid Info API | none (raw `fetch`) | `app/api/market/route.ts` | Adding new Hyperliquid request types, switching mainnet↔testnet, adding retry/backoff | Medium — this is the only network egress point; a URL/typo mistake here silently breaks all live data |
| `public/bg-dark.png` | Terminal theme background | — | `app/globals.css` (`--bg-image` for `data-theme="dark"`) | Regenerating theme art | Low, purely visual |
| `public/bg-light.png` | Paper theme background | — | `app/globals.css` (`data-theme="light"`) | Same | Low |
| `public/bg-matrix.png` | Matrix theme background | — | `app/globals.css` (`data-theme="matrix"`) | Same | Low |
| `public/bg-violet.png` | Midnight theme background | — | `app/globals.css` (`data-theme="violet"`) | Same | Low |
| `package.json` | Dependency manifest + npm scripts | — | npm/Vercel build | Adding a dependency or script | Medium — check `package-lock.json` stays consistent (`npm install` after any manual edit) |
| `package-lock.json` | Locked dependency tree | — | npm/Vercel build | Never hand-edit; regenerate via `npm install` | Medium |
| `tsconfig.json` | TypeScript config; defines `@/*` path alias to repo root | — | Every `.ts`/`.tsx` file via the `@/` import alias | Rarely | Medium — changing the alias breaks every `@/lib/...` import at once |
| `next.config.ts` | Next.js config (currently empty/default) | — | Next.js build | Adding redirects, headers, image domains, etc. | Low today, since it's empty |
| `.gitignore` | Standard Next.js ignores + `.env*` | — | git | Rarely | Low |
| `.env.local` | Vercel CLI metadata only (`VERCEL_OIDC_TOKEN`); gitignored | — | Not read by app code | Never manually; regenerated by `vercel link` | Low (contains no real secret) |

## Where to make common changes

- **Add a new config field to the dashboard** (e.g. a new risk parameter): add it to the `Config` interface and `DEFAULT_CONFIG` in `app/page.tsx`, add an `<input>`/`<select>` in the Config panel JSX, wire it into the `tick()`/`reconcile()` call if it affects trading logic, and consider whether it needs a corresponding field in `lib/paper.ts`'s `ReconcileConfig`.
- **Add a new page/route:** create `app/<name>/page.tsx` (see `app/changelog/page.tsx` as the minimal-page template).
- **Add a new API route:** create `app/api/<name>/route.ts` (see `app/api/market/route.ts` as the template — export `async function GET`/`POST`, use `NextRequest`/`NextResponse`, wrap in try/catch, set `dynamic = "force-dynamic"` if it must never be cached).
- **Modify the trading strategy math:** `lib/strategy.ts` (`ema`, `emaSeries`, `signal`). Cross-check against the Python original first.
- **Modify risk/kill-switch behavior:** `lib/risk.ts`.
- **Modify the paper-fill simulation (fees, slippage, reconcile logic):** `lib/paper.ts`.
- **Add a new theme:** (1) add a `:root[data-theme="name"]` block in `app/globals.css` with the full variable set copied from an existing block and re-colored, (2) add a matching `.swatch.name` rule, (3) generate a `public/bg-name.png` (see `DECISIONS.md` D-002/D-004 for how the existing 4 were made — a standalone Python/Pillow script, not committed to this repo), (4) add `{ key: "name", label: "..." }` to the `THEMES` array in `app/ThemeWheel.tsx`, (5) add `"name"` to the `valid` array in the inline script in `app/layout.tsx`.
- **Change the polling behavior / API integration:** `lib/hyperliquid.ts` and `app/api/market/route.ts`.
- **Update deployment settings:** no committed config beyond `next.config.ts`; Vercel project settings themselves are managed via the `vercel` CLI or the Vercel dashboard (see `DEPLOYMENT.md`).
- **Add an environment variable:** none currently exist; if adding one, update `CLAUDE.md`'s Environment setup section and this file, and use `vercel env add <NAME> production` to set it on Vercel.
- **Modify global styles:** `app/globals.css` — see the High-risk note in the table above about theme-variable discipline.
