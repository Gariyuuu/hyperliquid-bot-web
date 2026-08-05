import { NextRequest, NextResponse } from "next/server";
import { fetchMid, fetchRecentCloses } from "@/lib/hyperliquid";
import { signal } from "@/lib/strategy";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const symbol = (params.get("symbol") ?? "ETH").toUpperCase();
  const interval = params.get("interval") ?? "1m";
  const fast = parseInt(params.get("fast") ?? "9", 10);
  const slow = parseInt(params.get("slow") ?? "21", 10);
  const band = parseFloat(params.get("band") ?? "0.0008");

  try {
    const [mid, closes] = await Promise.all([
      fetchMid(symbol),
      fetchRecentCloses(symbol, interval, slow),
    ]);

    if (mid === null) {
      return NextResponse.json({ error: `no mid price for ${symbol}` }, { status: 404 });
    }

    const { target, gap } = signal(closes, fast, slow, band);

    return NextResponse.json({
      symbol,
      mid,
      closes,
      target,
      gap,
      ts: Date.now(),
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "unknown error" },
      { status: 502 }
    );
  }
}
