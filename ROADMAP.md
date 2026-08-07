# ROADMAP.md — hyperliquid-bot-web

No time estimates exist anywhere in this repository's history or commit messages, so none are invented here. Priority/difficulty/risk are qualitative assessments based on the current codebase, marked **Inferred** where they reflect judgment rather than an explicit user statement.

## Current milestone

**v0.4.0 — shipped.** Theme wheel, real PNG backgrounds, real app icon, cross-theme bug fixes. This is the current live state of the app. There is no partially-completed milestone in progress.

## Next milestone

None defined by the user. No milestone is currently planned.

## MVP completion

**Already reached and exceeded.** The original ask ("build me a Vercel version" to check out the bot's features) was satisfied by v0.1.0 (initial paper-trading dashboard). Everything since (v0.2.0–v0.4.0) has been polish/UX iteration on top of a working MVP, not core-functionality work.

## Post-MVP

Nothing formally scoped. Candidate ideas that came up organically during development but were **not** requested or committed to:

| Idea | Priority | Status | Dependencies | Difficulty | Risk | Definition of done |
|---|---|---|---|---|---|---|
| Automated test suite for `lib/` | Medium (Inferred) | Not started | Choose a test runner | Low | Low | Core pure functions have unit tests; `npm test` (or equivalent) runs in CI or at least locally |
| Multi-symbol / multi-strategy dashboard (watch several EMA configs at once) | Low (Inferred) | Not started | None technical; needs product decision | Medium | Low | N/A — not scoped |
| Server-side persistence of paper-account history (cross-device) | Low (Inferred) | Not started | Would require adding a database — a new architecture decision | High | Medium (changes the app's "no backend state" simplicity) | N/A — not scoped |

## Long-term ideas

- Real order placement against Hyperliquid (turning this from a paper simulator into an actual trading UI). **Explicitly flagged as a major architecture change, not a natural next step** — would require secure private-key handling that the current client-only, no-secrets design deliberately avoids. See `CLAUDE.md` → "Never silently replace an existing architectural pattern."

## Optional improvements

- Run `npm run lint` and fix findings (see `TASKS.md` T-002).
- Add bounds-checking to `/api/market` query params.
- Add a stylelint rule (or similar) to prevent hardcoded colors in `app/globals.css` from reintroducing the cross-theme bugs fixed this session.

## Out-of-scope features

Explicitly not part of this project's purpose (per `CLAUDE.md`'s project identity — a solo hobbyist paper-trading viewer, not a SaaS product):
- User accounts / multi-tenant support
- Payments/billing
- Mobile native app
- Support for exchanges other than Hyperliquid
- Real-money trading
