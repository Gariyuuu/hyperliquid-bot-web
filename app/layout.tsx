import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hyperliquid EMA Bot — Paper Dashboard",
  description: "Live paper-trading dashboard mirroring the hyperliquid-bot EMA crossover strategy.",
};

const THEME_SCRIPT = `
(function () {
  try {
    var saved = localStorage.getItem("hlbot-theme");
    var theme = saved === "light" || saved === "dark" ? saved : "dark";
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
