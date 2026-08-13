import type { Metadata } from "next";
import "./globals.css";

const SITE_URL = "https://hyperliquid-bot-web-alpha.vercel.app";
const TITLE = "Hyperliquid EMA Bot — Paper Dashboard";
const DESCRIPTION =
  "Read-only paper-trading dashboard mirroring a Python EMA(9/21) crossover strategy against live Hyperliquid market data — no real orders, no keys.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: "%s — Hyperliquid EMA Bot",
  },
  description: DESCRIPTION,
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "Hyperliquid EMA Bot",
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
  icons: {
    icon: "/icon.png",
  },
};

const THEME_SCRIPT = `
(function () {
  try {
    var valid = ["dark", "light", "matrix", "violet"];
    var saved = localStorage.getItem("hlbot-theme");
    var theme = valid.indexOf(saved) !== -1 ? saved : "dark";
    document.documentElement.setAttribute("data-theme", theme);
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
