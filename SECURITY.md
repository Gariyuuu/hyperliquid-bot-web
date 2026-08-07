# SECURITY.md — hyperliquid-bot-web

Defensive review only. No penetration testing or unauthorized access was attempted.

## Authentication boundaries

None exist. There is no login system. This is intentional (see `CLAUDE.md`/`DECISIONS.md` D-001) — the app has nothing to protect (no user data, no funds, no write access to anything).

## Authorization boundaries

None exist — everything is public by design.

## Protected routes

None. `/`, `/changelog`, and `/api/market` are all fully public.

## Secret handling

**No secrets exist in this application.** Verified: no `process.env.*` reference anywhere in `app/` or `lib/`; `.env.local` contains only a Vercel CLI OIDC token (not an application secret, gitignored, not read by app code). There is nothing to leak.

## Environment variables

None required or used by application code (see `CLAUDE.md` → Environment setup).

## Client-exposed variables

None (no `NEXT_PUBLIC_*` variables exist).

## Input validation

Weak, by design-of-omission rather than a known active vulnerability: `app/api/market/route.ts` accepts `symbol`, `interval`, `fast`, `slow`, `band` as query params with parse-and-default fallbacks, but no bounds-checking or allow-listing. Because this route only ever *reads* public Hyperliquid data and returns it (never writes, never uses input to construct a file path, shell command, or SQL query), the blast radius of bad input is limited to a possibly-weird 404/502/degenerate response to the same caller who sent it — not a vulnerability in the traditional sense, but worth tightening if this route is ever extended (see `TASKS.md`).

## Output encoding

Handled by React's default JSX escaping everywhere except one deliberate exception: `app/layout.tsx` line 24 uses `dangerouslySetInnerHTML` to inject the no-flash theme-init `<script>` (a **hardcoded constant string** defined in the same file, `THEME_SCRIPT` — not derived from any user input, request data, or external source). This is a standard, safe pattern for this specific purpose (inline scripts that must run before hydration cannot be added any other way in Next.js), not a vulnerability — but it is the one place in the codebase that bypasses React's default escaping, so it's worth knowing about if this file is ever changed. Do not make `THEME_SCRIPT`'s content depend on any dynamic/user-controllable value without re-evaluating this.

## SQL injection risk

Not applicable — no database, no SQL.

## Cross-site scripting (XSS) risk

Low. No user-generated content is ever rendered as HTML. All dynamic values (`mid`, `gap`, log lines, etc.) are rendered as plain React children (auto-escaped).

## CSRF protections

Not applicable in a meaningful sense — the one API route is a `GET` with no side effects and no session/cookie to forge.

## File upload risks

None — no file upload feature exists.

## Webhook verification

Not applicable — no webhooks are received.

## Rate limiting

None implemented on `/api/market`. A visitor (or a script) could hammer this endpoint, which would in turn hammer the upstream Hyperliquid API with no backoff. Low real-world risk given current (single-user) traffic, but worth knowing if this URL is ever shared widely.

## Admin access

Not applicable — no admin surface exists.

## Database policies

Not applicable — no database.

## Logging of sensitive data

Nothing sensitive is ever logged — there is no sensitive data in this app to begin with.

## Dependency concerns

Only 4 direct runtime dependencies (`next`, `react`, `react-dom`) plus TypeScript type packages. `npm install` reported "3 high severity vulnerabilities" in transitive dependencies during this session's setup (**Verified** — seen in `npm install` output), but `npm audit`'s specific findings were **not inspected in detail this session** — running `npm audit` is recommended before considering this fully cleared. No `npm audit fix` was run (would need review before applying, per the "don't upgrade dependencies casually" rule).

## Production security gaps

None identified beyond the dependency-audit gap above. The app's minimal surface area (no auth, no secrets, no database, no write paths) is itself the main mitigation.

## Recommended fixes

1. Run `npm audit` and review the "3 high severity" findings noted above; decide whether any are actually exploitable given this app has no server-side secrets or user data (many `npm audit` findings in frontend-adjacent tooling are non-issues for a project like this, but should be reviewed, not assumed).
2. Add basic bounds-checking to `/api/market`'s numeric query params (defensive hardening, not a known active exploit).
3. Consider a rate limit on `/api/market` if this URL is ever shared beyond personal use.
