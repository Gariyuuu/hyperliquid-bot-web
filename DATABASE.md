# DATABASE.md — hyperliquid-bot-web

**Not applicable. This application has no database.**

Verified by:
- No ORM package in `package.json` (no Prisma, Drizzle, Mongoose, etc.)
- No schema file, migration folder, or seed script anywhere in the repository
- No `DATABASE_URL` or similar env var referenced anywhere in source
- No `process.env.*` database-related reference exists in `app/` or `lib/`

## Actual persistence model

All state is client-side browser `localStorage`. See `ARCHITECTURE.md` → "Storage flow" for the exact keys and shapes:
- `hlbot-web-state-v1` → `{ config: Config, paper: PaperState, logLines: LogLine[] }`
- `hlbot-theme` → `"dark" | "light" | "matrix" | "violet"`

There are no tables, collections, relationships, indexes, constraints, row-level security policies, or migrations to document, because none exist.

If a future task adds a real database, this file must be rewritten from scratch to reflect it — do not attempt to retrofit this document.
