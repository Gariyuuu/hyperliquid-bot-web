import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hyperliquid EMA Bot — Paper Dashboard",
  description: "Live paper-trading dashboard mirroring the hyperliquid-bot EMA crossover strategy.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
