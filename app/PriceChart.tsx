"use client";

import { useMemo, useRef, useState } from "react";
import { emaSeries } from "@/lib/strategy";

interface Props {
  closes: number[];
  fast: number;
  slow: number;
  width?: number;
  height?: number;
}

const PAD_X = 6;
const PAD_Y = 10;

export default function PriceChart({ closes, fast, slow, width = 640, height = 160 }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const { pricePts, fastPts, slowPts, fastSeries, slowSeries, min, max, n } = useMemo(() => {
    const n = closes.length;
    if (n < 2) {
      return {
        pricePts: "",
        fastPts: "",
        slowPts: "",
        fastSeries: [] as number[],
        slowSeries: [] as number[],
        min: 0,
        max: 0,
        n,
      };
    }
    const fastSeries = emaSeries(closes, fast);
    const slowSeries = emaSeries(closes, slow);
    const all = [...closes, ...fastSeries, ...slowSeries];
    const min = Math.min(...all);
    const max = Math.max(...all);
    const span = Math.max(max - min, 1e-9);

    const x = (i: number) => PAD_X + (i / (n - 1)) * (width - PAD_X * 2);
    const y = (v: number) => PAD_Y + (1 - (v - min) / span) * (height - PAD_Y * 2);

    const toPath = (series: number[]) => series.map((v, i) => `${x(i)},${y(v)}`).join(" ");

    return {
      pricePts: toPath(closes),
      fastPts: toPath(fastSeries),
      slowPts: toPath(slowSeries),
      fastSeries,
      slowSeries,
      min,
      max,
      n,
    };
  }, [closes, fast, slow, width, height]);

  if (n < 2) {
    return <div className="chart-empty">Waiting for enough candles…</div>;
  }

  function handleMove(e: React.MouseEvent<SVGSVGElement>) {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const relX = ((e.clientX - rect.left) / rect.width) * width;
    const idx = Math.round(((relX - PAD_X) / (width - PAD_X * 2)) * (n - 1));
    setHoverIdx(Math.min(Math.max(idx, 0), n - 1));
  }

  const hoverX = hoverIdx !== null ? PAD_X + (hoverIdx / (n - 1)) * (width - PAD_X * 2) : null;

  return (
    <div className="chart-wrap">
      <div className="chart-legend">
        <span className="legend-item"><i className="dot price" />Price</span>
        <span className="legend-item"><i className="dot fast" />EMA {fast}</span>
        <span className="legend-item"><i className="dot slow" />EMA {slow}</span>
      </div>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        height={height}
        onMouseMove={handleMove}
        onMouseLeave={() => setHoverIdx(null)}
        className="chart-svg"
      >
        {[0.25, 0.5, 0.75].map((f) => (
          <line key={f} x1={PAD_X} x2={width - PAD_X} y1={height * f} y2={height * f} className="chart-grid" />
        ))}
        <polyline points={pricePts} className="chart-line price" />
        <polyline points={slowPts} className="chart-line slow" />
        <polyline points={fastPts} className="chart-line fast" />
        {hoverX !== null && (
          <line x1={hoverX} x2={hoverX} y1={PAD_Y} y2={height - PAD_Y} className="chart-crosshair" />
        )}
      </svg>
      {hoverIdx !== null && (
        <div className="chart-tooltip" style={{ left: `${(hoverX! / width) * 100}%` }}>
          <div><i className="dot price" />{closes[hoverIdx].toFixed(2)}</div>
          <div><i className="dot fast" />{fastSeries[hoverIdx].toFixed(2)}</div>
          <div><i className="dot slow" />{slowSeries[hoverIdx].toFixed(2)}</div>
        </div>
      )}
    </div>
  );
}
