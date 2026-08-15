import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          background: "#07090c",
          padding: "90px",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 68,
            fontWeight: 700,
            color: "#f4f6f9",
            letterSpacing: -1,
          }}
        >
          Hyperliquid EMA Bot
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 30,
            color: "#9aa4b2",
            marginTop: 28,
            maxWidth: 920,
          }}
        >
          Paper-trading dashboard mirroring a live EMA crossover strategy — no real orders, no keys.
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 24,
            color: "#2fe07a",
            marginTop: 48,
            fontWeight: 600,
          }}
        >
          hyperliquid-bot-web-alpha.vercel.app
        </div>
      </div>
    ),
    { ...size }
  );
}
