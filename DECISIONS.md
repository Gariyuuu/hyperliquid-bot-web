# DECISIONS.md — hyperliquid-bot-web

Architectural decision log. Evidence trail is commit history (`git log`) plus direct source inspection. Reasoning is marked **Verified** where it is directly evidenced by commit messages/code comments/explicit design constraints found in the repo, or **Inferred** where it is a reasonable reconstruction without a direct textual source. Nothing here is fabricated — where reasoning could not be determined, it is marked **Unknown** rather than guessed.

---

### D-001 — Paper-trading only, no real order placement

- **Status:** Accepted, foundational.
- **Context:** The app is a web port of a Python bot that *can* trade real money on Hyperliquid (given `DRY_RUN=false`, `USE_TESTNET=false`, `ALLOW_MAINNET=yes` all set). The web version needed a way to demonstrate the strategy.
- **Decision:** The web app never places real orders and never accepts an exchange private key. It reads live public market data and runs a client-side fill simulator (`lib/paper.ts`) instead.
- **Reasoning (Verified — this is an explicit, stated design constraint, not inferred):** A publicly-deployed Vercel app holding a real private key, or accepting one from a visitor, is a materially different and riskier product than a private CLI tool. The safe default for a public-facing dashboard is simulation.
- **Alternatives considered:** Real trading via a securely stored key (rejected — out of scope, major security surface, would need a backend to hold the key at all since this is a client-heavy app).
- **Consequences:** The app can never be mistaken for a real trading interface. Its entire value is "watch the strategy," not "execute the strategy." Any future request to add real trading must be treated as a new project, not an incremental change (see `CLAUDE.md`).
- **Affected files:** `lib/paper.ts` (entire file exists because of this decision), `lib/hyperliquid.ts` (only implements read endpoints — `allMids`, `candleSnapshot`, `meta` — never `Exchange`/order-placement calls).

---

### D-002 — Exact-port discipline for strategy/risk/paper-fill math

- **Status:** Accepted, foundational.
- **Context:** The whole point of the app is to mirror a specific existing bot's behavior, not to invent a new strategy.
- **Decision:** `lib/strategy.ts`, `lib/risk.ts`, and `lib/paper.ts` are direct, literal translations of the Python bot's `strategy.py`, `risk.py`, and `hl_client.py`/`bot.py` — same EMA seeding (seeded with the first value, not an SMA seed), same kill-switch threshold logic, same fee (0.045%) and slippage (0.05%) constants.
- **Reasoning (Verified — stated in file-header comments in the source, e.g. `lib/paper.ts` line 1-2: "Exact port of hyperliquid-bot/hl_client.py's PaperBook + bot.py's reconcile()..."):** If the web dashboard's signal ever disagreed with the real bot's signal given the same inputs, the dashboard would be actively misleading about what the real bot does.
- **Alternatives considered:** None — this was the explicit ask, not a choice among options.
- **Consequences:** Any change to this math must be justified against the Python source, not just "improved" in isolation.
- **Affected files:** `lib/strategy.ts`, `lib/risk.ts`, `lib/paper.ts`.

---

### D-003 — No database, no backend state, `localStorage` only

- **Status:** Accepted.
- **Context:** The app needs *some* persistence for the paper account and config across reloads.
- **Decision:** Use browser `localStorage` exclusively; no database, no server-side session.
- **Reasoning (Inferred, but high-confidence — consistent with the app's minimal scope and single-user-per-browser usage pattern):** Adding a database for a solo hobbyist demo tool would be disproportionate complexity for the actual need (one user, no cross-device requirement stated).
- **Alternatives considered:** A database-backed account (rejected as unnecessary for current scope — see `ROADMAP.md` "Post-MVP" for this listed as a possible, not planned, future direction).
- **Consequences:** No cross-device continuity. Clearing browser storage resets the paper account. This is documented as expected behavior, not a bug.
- **Affected files:** `app/page.tsx` (all the `localStorage.getItem`/`setItem` calls).

---

### D-004 — 4-theme wheel instead of a light/dark toggle

- **Status:** Accepted, supersedes an earlier design.
- **Context:** The app initially shipped with a binary light/dark `ThemeSlider`. The user explicitly asked for "a bit more choices... a theme wheel with different backgrounds rather than just a light and dark mode."
- **Decision:** Replaced `ThemeSlider.tsx` (deleted) with `ThemeWheel.tsx`, expanding from 2 themes to 4: Terminal (dark, default), Paper (light), Matrix (green hacker-terminal), Midnight (violet).
- **Reasoning (Verified — directly requested by the user in this session):** More visual variety, explicitly requested.
- **Alternatives considered:** A single-slider "intensity" control (considered, not chosen — a discrete swatch picker was judged the more standard, legible pattern for "pick one of several named themes").
- **Consequences:** Every themed CSS rule must now account for 4 states instead of 2, which is exactly what caused D-005 below.
- **Affected files:** `app/ThemeWheel.tsx` (new, replaces deleted `ThemeSlider.tsx`), `app/globals.css` (2 theme blocks → 4), `app/layout.tsx` (inline script's valid-theme list), `public/bg-matrix.png` and `public/bg-violet.png` (new assets).

---

### D-005 — Every theme color must be a CSS variable; hardcoded colors are bugs

- **Status:** Accepted, corrective.
- **Context:** After shipping the 4-theme wheel, the user reported two visual problems that turned out to share one root cause: some CSS rules referenced literal hex/rgba colors instead of the theme's CSS variables, so those elements didn't change with the theme (a chart tooltip stayed dark-background-with-adapting-text-color, becoming illegible in the light theme; several accent glows stayed blue even in the green/violet themes).
- **Decision:** Established as a hard rule (now documented in `CLAUDE.md` → "DO NOT CHANGE WITHOUT REVIEW"): any color in `app/globals.css` outside a `:root[data-theme=...]` block definition must be `var(--...)` or `color-mix(in srgb, var(--...) N%, transparent)`, never a literal value.
- **Reasoning (Verified — directly evidenced by the bugs found and the fix commit `7df08aa`, "Fix cross-theme color leaks: chart tooltip contrast bug, hardcoded accent colors"):** Literal colors silently desync from the active theme with no compile-time or runtime signal that anything is wrong — they only surface as a visual bug when someone actually looks at the non-default theme.
- **Alternatives considered:** A lint rule / stylelint config to enforce this automatically (not implemented — noted as technical debt in `TASKS.md`).
- **Consequences:** Future themes/colors must follow this pattern or risk repeating the exact same class of bug.
- **Affected files:** `app/globals.css` (multiple rules fixed: `.hero-price::before`, `.dot.fast`, `.dot.slow`, `button.primary`, `.chart-tooltip`).

---

### D-006 — Background overlay opacity corrected downward

- **Status:** Accepted, corrective.
- **Context:** The first version of the real-PNG-background feature used a `body::after` color overlay at ~0.5–0.62 opacity on top of the background image, intended to preserve text legibility.
- **Decision:** Lowered `--bg-overlay` to roughly 0.22–0.35 across themes, and increased the glow intensity baked into the PNGs themselves, so the background art is actually visible.
- **Reasoning (Verified — the user's exact words were "barely a fade... definitely not a png"):** The original overlay was strong enough to defeat the purpose of having a real background image at all.
- **Alternatives considered:** Removing the overlay entirely (rejected — some overlay is still needed for text legibility against a busy image; the fix was tuning the value down, not removing the mechanism).
- **Consequences:** Backgrounds are now clearly visible in all themes, verified via Playwright screenshots.
- **Affected files:** `app/globals.css` (`--bg-overlay` in every theme block), and the background-generation script itself (external to this repo — see `HANDOFF.md` for where it lives).

---

### D-007 — Background PNGs generated procedurally with Python/Pillow, not fetched or hand-drawn

- **Status:** Accepted.
- **Context:** The user explicitly required "real PNG background... not just colors" (rejecting a pure-CSS-gradient approach) and separately clarified images must not be fetched from external/guessed URLs.
- **Decision:** Backgrounds were generated with a standalone Python script (using Pillow) that composites gradients, radial glows, a perspective grid + candlestick silhouette (for this repo specifically), grain/noise, and a vignette — then saved as real PNG files committed to `public/`.
- **Reasoning (Verified — explicit user requirement plus the general rule against generating/guessing URLs for non-programming purposes):** A locally-generated asset satisfies "real PNG" without any external-fetch risk.
- **Alternatives considered:** CSS-only gradients (explicitly rejected by the user), fetching a stock image (not attempted — would require a URL the AI would have to guess, against policy).
- **Consequences:** The generator script is **not part of this repository** — it lived in a scratch/session directory outside version control. If backgrounds need regenerating or a new theme's background is needed, that script must be recreated or the images hand-edited; there is no `npm run generate-bg` or similar committed tooling. **This is a real gap** — flagged in `TASKS.md`/`HANDOFF.md`.
- **Affected files:** `public/bg-*.png` (outputs only; no generator script is present in this repo).

---

### D-008 — Chart-line and theme accent colors chosen from a validated colorblind-safe categorical palette

- **Status:** Accepted.
- **Context:** `app/PriceChart.tsx` draws two simultaneous lines (fast EMA, slow EMA) that must stay visually distinguishable from each other, including for colorblind viewers.
- **Decision:** The Terminal (default/dark) theme's `--blue` (`#3987e5`) and `--orange` (`#d95926`) values are not arbitrary — they are specific steps from a pre-validated categorical color system (slots 1 and 2 of an 8-hue palette whose adjacent-pair ordering was specifically chosen and tested so that neighboring slots clear a colorblind-safety threshold when used together, e.g. for exactly this "two lines on one chart" case). The Matrix and Midnight themes' equivalents (`--blue`/`--orange` re-mapped to green/violet and violet/pink respectively) were chosen to preserve a similar mutual-distinguishability within each theme's palette, though only the default theme's pair is from the literally-validated source palette.
- **Reasoning (Verified — this was a deliberate methodological choice made when building the chart, not discoverable from the code alone since the hex values alone don't reveal *why* those two specific values were picked over any other blue/orange):** Picking chart-line colors ad hoc risks a pair that looks fine to most people but is indistinguishable to colorblind viewers; using a pre-validated adjacent pair avoids that without needing to re-derive/test it from scratch.
- **Alternatives considered:** Arbitrary/aesthetic color choice (rejected in favor of a systematic approach for this specific two-simultaneous-lines case).
- **Consequences:** If the EMA chart ever grows a third simultaneous series, don't just pick a third arbitrary color — go back to the same source palette's ordering (slot 3 = aqua/teal) rather than guessing, to preserve the same safety property.
- **Affected files:** `app/globals.css` (`--blue`/`--orange` in every theme block), `app/PriceChart.tsx` (consumes them via `.dot.fast`/`.dot.slow`/`.chart-line.fast`/`.chart-line.slow`).
