# HANDOFF.md — hyperliquid-bot-web

Short, high-signal onboarding for a brand-new Claude Code account with zero access to prior conversations.

## What is this project?

A Next.js web dashboard that mirrors the EMA-crossover trading strategy of a separate Python bot (`~/Projects/hyperliquid-bot`), using live public Hyperliquid market data and a client-side $1,000 paper-trading simulation. No real money, no exchange keys, no login, no database. It has 4 selectable visual themes and is deployed live on Vercel.

## What should I read first?

In this order: `CLAUDE.md` → `PROJECT_STATE.md` → `TASKS.md` → (if doing UI work) `UI_SYSTEM.md` and `DECISIONS.md` D-004/D-005/D-006 → (if doing logic work) `ARCHITECTURE.md` and `FEATURES.md`.

## What is the current task?

**None (application-wise).** Task `C-004`, a fourth checkpoint ("final transfer checkpoint"), is complete as of this writing (see `TASKS.md`). The repository is in a complete, deployed, verified state; application code is unchanged since commit `7df08aa`. There is no in-progress feature work to resume. The 17-file documentation set is fully committed (at `70f4a80`, by the owner) and this checkpoint added the previously-missing `README.md` and fixed stale "docs uncommitted" language left over from earlier passes — there is no open commit decision left.

## What was the previous agent doing?

Building the app from scratch (2026-08-05), then iterating on UI/UX per direct user feedback across several rounds: full visual redesign → real PNG backgrounds + a light/dark slider → user said light mode was ugly and backgrounds barely visible + wanted more theme choices + a real favicon → replaced the slider with a 4-swatch theme wheel (Terminal/Paper/Matrix/Midnight), regenerated all backgrounds stronger, added a real icon. Then found and fixed two cross-theme CSS bugs via actual Playwright screenshots. Then performed a full documentation/handoff audit (task `C-001`) creating a 16-file memory system (all but `README.md`). Then a second checkpoint pass (`C-002`) re-verifying everything and adding `DECISIONS.md` D-008. Then a third checkpoint pass (`C-003`) that independently re-derived the repo's state, found zero drift, and re-confirmed the paper-trading-only claim via direct code spot-check. At that point the owner committed all 17 files as `70f4a80`. Then this pass (`C-004`, "final transfer checkpoint") found the repo at 16/17 docs (README missing), added `README.md`, re-verified everything against real code/git state, ran `npm run build` clean, scanned for secrets (none found), and — the one substantive finding — caught that `CLAUDE.md`/`PROJECT_STATE.md`/`TASKS.md`/`HANDOFF.md` still described the doc set as uncommitted even though it had already been committed; corrected that contradiction in all four files. No application code changed in this pass either.

## What works right now?

Everything. See `PROJECT_STATE.md` → "What currently works" for the specific Verified list (build clean, live URL 200, all 4 themes correct, API route returns live data, localStorage persistence works).

## What is broken?

Nothing known. Zero open bugs.

## What should I do next?

Nothing is required — there is no open decision left over from prior checkpoints. If given a new task, just do it following the rules in `CLAUDE.md`. If you want optional, non-blocking improvements to pick from, see `TASKS.md` → "Next up" (a test suite is the most valuable one — there currently is none; running `npm run lint` and deciding on an ESLint setup is the other).

## Which files are most important?

`app/page.tsx` (the entire app UI/state), `lib/strategy.ts` + `lib/risk.ts` + `lib/paper.ts` (the "exact port" trading logic — treat with care), `app/globals.css` (all styling and all 4 themes), `app/api/market/route.ts` (the only backend code).

## Which areas are dangerous to modify?

1. The math in `lib/strategy.ts`/`lib/risk.ts`/`lib/paper.ts` — it's a deliberate exact port of a real Python bot's logic. Don't "improve" it without cross-checking the Python source and recording the change in `DECISIONS.md`.
2. Any color in `app/globals.css` — must be a `var(--...)` (or `color-mix()` against one), never a literal hex/rgba, or you will reintroduce a bug class that has already happened twice (see `DECISIONS.md` D-005).
3. `--bg-overlay` values — don't raise them back toward 0.5+ (see D-006, the user explicitly rejected that).

## Which commands should I run first?

```
cd ~/Projects/hyperliquid-bot-web
git status                 # confirm clean tree
git log --oneline -5       # confirm you're at or past 7df08aa
npm install                # if node_modules isn't already present
npm run build              # confirm still clean
```

## How do I verify the app still works?

Run `npm run start -- -p 3411` (after `npm run build`) and check `http://localhost:3411/` loads, shows a live price after pressing Start, and the theme wheel switches correctly between all 4 themes. See `TESTING.md` for the full manual smoke-test checklist. For a deployed check, `vercel --prod --yes` then `curl -s -o /dev/null -w "%{http_code}" https://hyperliquid-bot-web-alpha.vercel.app/` should return `200`.

---

## Prompt for the next Claude Code account

```
Read CLAUDE.md, PROJECT_STATE.md, TASKS.md, and HANDOFF.md in this repository in full.
Then run `git status`, `git log --oneline -10`, and `git fetch origin` (read-only) and compare
against what those files claim. Then run `npm run build` and confirm it is still clean.

Current true state as of the last checkpoint (C-004, 2026-08-07): application code unchanged
since commit 7df08aa; the 17-file documentation set (including README.md) is fully committed
on main; working tree was clean at that checkpoint. This app is paper-trading-only — no real
Hyperliquid orders, no private key, no exchange credentials anywhere in the codebase; verify
that claim yourself against lib/hyperliquid.ts and package.json rather than just trusting this
line, since it is the single most important safety fact about this repo.

Summarize your understanding of this project's current state in a few sentences before making
any change. If you find any contradiction between the docs and the actual repository state, or
any documentation that looks stale, say so explicitly before proceeding — do not silently trust
or silently discard it (a real one was found and fixed during C-004: several docs claimed the
17-file doc set was uncommitted after the owner had already committed it — check for this class
of drift, since checkpoint passes are exactly where it creeps in). Do not redo any already-
completed work described in CHANGELOG.md or SESSION_LOG.md. Preserve the existing architecture
(no database, no auth, client-side-only paper trading, CSS-variable-driven theming) unless there
is a strong, explicitly stated reason to change it. After completing whatever task you're given,
update PROJECT_STATE.md, TASKS.md, append to SESSION_LOG.md, and update any other documentation
file your change affects, per the permanent rules in CLAUDE.md.
```
