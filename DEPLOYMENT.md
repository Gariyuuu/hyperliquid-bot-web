# DEPLOYMENT.md — hyperliquid-bot-web

## Hosting platform

Vercel. Project: `garywangsmes-8349s-projects/hyperliquid-bot-web` (Verified via `vercel` CLI output throughout this session).

## Production URL

`https://hyperliquid-bot-web-alpha.vercel.app` (Verified — returns HTTP 200 as of this audit).

## Project configuration

No `vercel.json` exists in the repo — all settings are Vercel defaults for a Next.js App Router project (auto-detected framework, default build/output settings). Verified: no `vercel.json` file present.

## Build command

`next build` (Vercel's Next.js framework default; not overridden). Locally this is `npm run build`.

## Install command

`npm install` (Vercel default for a repo with `package-lock.json` present and no other lockfile).

## Runtime version

Not pinned in this repo (no `.nvmrc`, no `engines` field in `package.json`). Vercel will use its own default Node.js runtime version for the account/project settings — **Unknown** exactly which version without checking the Vercel project dashboard directly.

## Output configuration

Default Next.js output (`.next/` — not `output: "export"`, since API routes require a server runtime). Verified: `next.config.ts` has no `output` override.

## Environment variables

**None required.** Nothing to configure in Vercel's environment variable settings for this project (Verified — see `CLAUDE.md`/`SECURITY.md`).

## Domains

Only the default `*.vercel.app` domain has been used and verified this session. **Unknown** whether a custom domain exists (not checked against the Vercel dashboard directly — only the known `hyperliquid-bot-web-alpha.vercel.app` URL was exercised).

## Preview deployments

Every `vercel --prod --yes` run this session also produced a unique preview-style deployment URL (e.g., `hyperliquid-bot-pc4i77x3g-garywangsmes-8349s-projects.vercel.app`) before being aliased to production. Standard Vercel behavior — not specially configured. Pushing to `main` on GitHub should also trigger Vercel's Git integration to build automatically (Inferred from the project being linked to `Gariyuuu/hyperliquid-bot-web` via `vercel link`'s auto-detection during setup — **not independently re-verified this session** by actually pushing without also running `vercel --prod` manually).

## Database deployment / migrations

Not applicable — no database.

## Storage setup

Not applicable — no external storage; static assets ship as part of the Next.js build (`public/` folder).

## External service setup

Not applicable — the only external call (Hyperliquid public Info API) requires no account, key, or setup.

## Scheduled jobs / webhooks

None configured.

## Build failures

None encountered this session. If `npm run build` ever fails, the first thing to check is a TypeScript type error (Next.js runs type-checking as part of `build`) — there is no separate lint-only or type-check-only failure mode observed yet.

## Runtime limitations

Standard Vercel serverless function limits apply to `/api/market` (execution time, payload size) — not a concern at this app's actual usage (a small, fast, read-only proxy call).

## Rollback procedure

Standard Vercel rollback: use `vercel rollback` or the Vercel dashboard to promote a previous deployment back to production. Not exercised this session (no rollback was ever needed).

## Deployment checklist

1. `git status` — confirm intended changes are committed.
2. `npm run build` locally — must be clean.
3. `git push` (if using the GitHub integration) and/or `vercel --prod --yes` directly from the repo root.
4. After deploy completes, `curl -s -o /dev/null -w "%{http_code}" <production-url>/` — confirm 200.
5. Spot-check any changed feature on the live URL (see `TESTING.md` smoke-test checklist).

## Post-deployment verification (performed this session, every deploy)

`curl` checks against `/`, `/changelog`, `/icon.png`, and every `public/bg-*.png`, all confirmed 200. Playwright screenshots of all 4 themes after the final deploy of this session, confirmed visually correct.
