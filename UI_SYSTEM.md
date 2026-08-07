# UI_SYSTEM.md — hyperliquid-bot-web

All file paths **Verified** at commit `7df08aa`.

## Layout system

Single-column, max-width-constrained (`.wrap { max-width: 1100px; margin: 0 auto; }`, defined in `app/globals.css`). No sidebar, no multi-page navigation — this is a one-page app plus one static changelog page.

## Navigation

Two "pages" total: `/` (the dashboard) and `/changelog`. Navigation between them is a single `<Link className="nav-link">Patch notes</Link>` in the dashboard header pointing to `/changelog`, and a "← Back to dashboard" link on the changelog page back to `/`. No nav bar, no menu, no routing beyond these two.

## Page structure

`app/page.tsx` renders, top to bottom: header bar (brand + live/stopped pill + patch-notes link + theme wheel) → subtitle line → paper-trading disclaimer banner → hero section (price card + 4-stat grid with position meter) → `PriceChart` → Config panel (10 inputs/selects + preset buttons + start/stop/reset) → Log panel (scrolling activity feed) → footer disclaimer.

## Reusable components

Only two extracted components exist:
- `app/PriceChart.tsx` — the SVG chart.
- `app/ThemeWheel.tsx` — the theme picker.

Everything else (cards, panels, buttons, pills, the log) is inline JSX styled by className with no extracted `<Card>`/`<Button>`/`<Panel>` component. This is a deliberate simplicity choice for a small app, not an oversight — see `CLAUDE.md` coding conventions.

## Component hierarchy

```
RootLayout (app/layout.tsx)
└─ Page (app/page.tsx)
   ├─ ThemeWheel (app/ThemeWheel.tsx)
   └─ PriceChart (app/PriceChart.tsx)

RootLayout (app/layout.tsx)
└─ ChangelogPage (app/changelog/page.tsx)
```

## Themes

Defined entirely in `app/globals.css` as `:root` / `:root[data-theme="..."]` variable blocks. Four themes exist: `dark` (Terminal, default), `light` (Paper), `matrix` (Matrix), `violet` (Midnight). Full variable catalogue per theme includes: `--page`, `--surface`/`--surface-solid`/`--surface-2`, `--border`/`--border-strong`, `--hover-wash`, `--input-bg`, `--text`/`--text-secondary`/`--muted`, `--long`/`--long-bright`, `--short`/`--short-bright`, `--warning`, `--blue`, `--orange`, `--bg-image`, `--bg-overlay`, `--crosshair`, `--banner-bg`/`--banner-border`/`--banner-text`/`--banner-text-strong`. See `app/globals.css` for exact hex values per theme.

## Background system

Each theme's `--bg-image` points to a real PNG in `public/` (`bg-dark.png`, `bg-light.png`, `bg-matrix.png`, `bg-violet.png`), applied via `body::before` with `background-size: cover; background-position: center top; position: fixed;`. A `body::after` renders `--bg-overlay` (a translucent color wash, ~22–35% opacity depending on theme) on top for text legibility, without hiding the image (see `DECISIONS.md` D-006 for why the opacity is tuned this specific way — it was previously too strong and explicitly corrected).

## Colors

All theme-dependent colors are CSS custom properties — see Themes above. There is no separate design-token file; `app/globals.css` *is* the design-token source.

## Typography

System font stack only: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif` (declared once on `:root` in `app/globals.css`). No custom webfont. Numeric displays use `font-variant-numeric: tabular-nums`.

## Spacing / border-radius / shadows

No formal token scale. Observed conventions (not enforced by variables): panel radius 14–16px, control radius 8–9px, pill/button-pill radius 999px. Shadows are used sparingly, mostly on `button.primary`/`button.stop` (colored glow shadows matching the button's semantic color) and the chart tooltip (`box-shadow: 0 4px 16px rgba(0,0,0,0.25)`).

## Breakpoints

One: `@media (max-width: 720px)` — collapses `.hero` from a 2-column to 1-column grid. No other responsive breakpoints exist. Not verified below 720px beyond this one rule (no additional mobile-specific layout has been screenshot-tested).

## Animations

One `@keyframes pulse` (opacity 1 → 0.35 → 1), used on: the header's live-status dot (`.dot-live`), and the `.pill.running::before` indicator dot. Button hover/active states use CSS `transition` (border-color/background/transform), not keyframe animation.

## Icon system

No icon font or SVG icon library. The only "icon" in the UI is the 🔥 emoji on the Crazy-mode button, plus the app icon/favicon (`app/icon.png`, a procedurally-generated 512×512 PNG — a 5-bar rising candlestick glyph on a dark rounded-square background, auto-detected by Next.js's App Router file convention).

## Image asset conventions

All images live in `public/` at the repo root (flat, no subfolders) except `app/icon.png` which follows Next's special App Router convention (must be named `icon.png`/`icon.svg`/etc. and placed directly in `app/`).

## Modals / notifications

None exist. Errors and status are surfaced inline (the activity log panel, colored pills) — there is no toast library, no modal dialog anywhere in the app.

## Forms

One form-like area: the Config panel, a grid of `<input type="number">` / `<select>` elements, all controlled components bound directly to the `config` state object in `app/page.tsx`. No form library (no React Hook Form/Formik), no client-side validation beyond the browser's native `type="number"` input constraints.

## Loading states

Minimal/implicit. Price shows `"—"` before the first successful fetch. The chart shows "Waiting for enough candles…" if fewer than 2 data points exist. There is no spinner/skeleton anywhere.

## Empty states

The log panel shows a placeholder line ("Press Start to begin polling live market data…") when `logLines` is empty.

## Error states

Errors append a red-styled line to the activity log (`.err` class → `color: var(--short-bright)`). There is no separate error banner/toast system.

## Accessibility

`ThemeWheel` swatches use `role="radiogroup"`, `role="radio"`, `aria-checked`, and a `title` attribute per swatch. No other explicit ARIA authoring was found elsewhere in the app. Not tested with a screen reader — **Unknown** whether the rest of the app (config inputs, buttons, log panel) is fully accessible.

## Browser support

Uses modern CSS (`color-mix()`, CSS custom properties, `backdrop`-adjacent techniques are not used but `color-mix` requires a fairly modern browser — Chromium 111+/Safari 16.2+/Firefox 113+ per general web-platform knowledge, **Inferred**, not stated anywhere in the repo). No polyfills, no browserslist config found.

## Known visual inconsistencies

None currently open — the two found this session (chart tooltip contrast, hardcoded accent glows) were fixed in commit `7df08aa` and re-verified.
