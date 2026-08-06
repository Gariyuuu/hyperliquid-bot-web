import Link from "next/link";

const ENTRIES = [
  {
    version: "v0.4.0",
    date: "2026-08-05",
    items: [
      "Real favicon/app icon (candlestick mark) instead of the blank default.",
      "Replaced the light/dark slider with a 4-way theme wheel: Terminal (dark), Paper (light), Matrix, Midnight.",
      "Regenerated every background: much stronger, more visible glow + grid in the dark themes (the old overlay was muting the PNG too much), and a near-solid, minimal Paper background instead of the washed-out pastel one.",
    ],
  },
  {
    version: "v0.3.0",
    date: "2026-08-05",
    items: [
      "Real PNG background art for dark and light modes — perspective grid + candlestick silhouette.",
      "Light/dark theme slider in the header, persisted per-browser.",
      "This patch notes page.",
    ],
  },
  {
    version: "v0.2.0",
    date: "2026-08-05",
    items: [
      "Redesigned as a trading-terminal dashboard: glowing hero price card, position meter bar, glassy stat cards.",
      "Added a live EMA sparkline chart (price + fast/slow EMA lines) with hover crosshair, drawn from the same candle data the bot polls.",
      "Color-coded BUY/SELL lines in the activity log.",
    ],
  },
  {
    version: "v0.1.0",
    date: "2026-08-05",
    items: [
      "Initial paper-trading dashboard, ported from the hyperliquid-bot Python CLI.",
      "Reads live public Hyperliquid market data; runs the exact same EMA-crossover signal, position clamp, min-order filter, and session kill-switch as the original bot.",
      "Simulated $1,000 paper account (0.045% taker fee, 0.05% slippage) stored in browser localStorage — no real keys, no real orders.",
      "Normal / Fast / Crazy mode presets matching the original run.sh / run-fast.sh / run-crazy.sh env overrides.",
      "Deployed to Vercel.",
    ],
  },
];

export default function ChangelogPage() {
  return (
    <div className="wrap">
      <div className="top">
        <div className="brand">
          <h1>Patch Notes</h1>
        </div>
        <Link href="/" className="nav-link">← Back to dashboard</Link>
      </div>
      <div className="sub">Hyperliquid EMA Bot — Paper Dashboard</div>

      <div className="panel">
        {ENTRIES.map((e) => (
          <div className="patch-entry" key={e.version}>
            <div className="patch-version">{e.version}</div>
            <div className="patch-date">{e.date}</div>
            <ul>
              {e.items.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
