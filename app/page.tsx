"use client";

import { useEffect, useRef, useState } from "react";
import { useFlash } from "./useFlash";
import Link from "next/link";
import { initPaperState, reconcile, PaperState } from "@/lib/paper";
import type { Signal } from "@/lib/strategy";
import PriceChart from "./PriceChart";
import ThemeWheel from "./ThemeWheel";

interface Config {
  symbol: string;
  interval: string;
  fastEma: number;
  slowEma: number;
  neutralBand: number;
  pollSeconds: number;
  maxPositionUsd: number;
  dailyMaxLossUsd: number;
  minOrderUsd: number;
  leverage: number;
}

const DEFAULT_CONFIG: Config = {
  symbol: "ETH",
  interval: "1m",
  fastEma: 9,
  slowEma: 21,
  neutralBand: 0.0008,
  pollSeconds: 15,
  maxPositionUsd: 50,
  dailyMaxLossUsd: 20,
  minOrderUsd: 10,
  leverage: 1,
};

const PRESETS: Record<string, Partial<Config>> = {
  normal: { pollSeconds: 15, fastEma: 9, slowEma: 21, neutralBand: 0.0008, maxPositionUsd: 50, dailyMaxLossUsd: 20, leverage: 1 },
  fast: { pollSeconds: 3, fastEma: 5, slowEma: 13, neutralBand: 0.0004, maxPositionUsd: 50, dailyMaxLossUsd: 20, leverage: 1 },
  crazy: { pollSeconds: 2, fastEma: 3, slowEma: 8, neutralBand: 0.0001, maxPositionUsd: 20000, dailyMaxLossUsd: 995, leverage: 20 },
};

const STORAGE_KEY = "hlbot-web-state-v1";

interface LogLine {
  ts: number;
  text: string;
  isErr?: boolean;
}

function fmtUsd(n: number): string {
  const sign = n < 0 ? "-" : "";
  return `${sign}$${Math.abs(n).toFixed(2)}`;
}

function lineClass(l: LogLine): string {
  if (l.isErr) return "err";
  if (l.text.includes("BUY")) return "buy-line";
  if (l.text.includes("SELL") || l.text.includes("CLOSE")) return "sell-line";
  return "";
}

export default function Page() {
  const [config, setConfig] = useState<Config>(DEFAULT_CONFIG);
  const [paper, setPaper] = useState<PaperState>(initPaperState());
  const [running, setRunning] = useState(false);
  const [logLines, setLogLines] = useState<LogLine[]>([]);
  const [mid, setMid] = useState<number | null>(null);
  const [gap, setGap] = useState<number | null>(null);
  const [target, setTarget] = useState<Signal>(0);
  const [closes, setCloses] = useState<number[]>([]);
  const logRef = useRef<HTMLDivElement>(null);
  const tickRef = useRef(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.config) setConfig(parsed.config);
        if (parsed.paper) setPaper(parsed.paper);
        if (parsed.logLines) setLogLines(parsed.logLines);
      }
    } catch {
      // ignore corrupt storage
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ config, paper, logLines }));
  }, [config, paper, logLines]);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [logLines]);

  function pushLog(text: string, isErr = false) {
    setLogLines((prev) => [...prev.slice(-200), { ts: Date.now(), text, isErr }]);
  }

  async function tick() {
    if (tickRef.current) return;
    tickRef.current = true;
    try {
      const params = new URLSearchParams({
        symbol: config.symbol,
        interval: config.interval,
        fast: String(config.fastEma),
        slow: String(config.slowEma),
        band: String(config.neutralBand),
      });
      const res = await fetch(`/api/market?${params}`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) {
        pushLog(`market fetch error: ${data.error ?? res.status}`, true);
        return;
      }
      setMid(data.mid);
      setGap(data.gap);
      setTarget(data.target);
      setCloses(data.closes ?? []);

      setPaper((prevPaper) => {
        if (prevPaper.halted) return prevPaper;
        const result = reconcile(prevPaper, data.mid, data.target, {
          maxPositionUsd: config.maxPositionUsd,
          minOrderUsd: config.minOrderUsd,
          dailyMaxLossUsd: config.dailyMaxLossUsd,
        });
        const gapStr = data.gap !== null ? `${(data.gap * 100).toFixed(3)}%` : "n/a";
        const dirLabel = data.target === 1 ? "LONG" : data.target === -1 ? "SHORT" : "FLAT";
        pushLog(
          `px=${data.mid.toFixed(2)} gap=${gapStr} sig=${dirLabel} pos=${fmtUsd(result.posUsd)} eq=${fmtUsd(result.equity)} pnl=${fmtUsd(result.pnl)} :: ${result.action}`
        );
        if (result.state.halted && !prevPaper.halted) {
          setRunning(false);
        }
        return result.state;
      });
    } catch (err) {
      pushLog(`error: ${err instanceof Error ? err.message : String(err)}`, true);
    } finally {
      tickRef.current = false;
    }
  }

  useEffect(() => {
    if (!running) return;
    tick();
    const id = setInterval(tick, Math.max(1, config.pollSeconds) * 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, config.symbol, config.interval, config.fastEma, config.slowEma, config.neutralBand, config.pollSeconds, config.maxPositionUsd, config.dailyMaxLossUsd, config.minOrderUsd]);

  function applyPreset(name: keyof typeof PRESETS) {
    setConfig((c) => ({ ...c, ...PRESETS[name] }));
    pushLog(`preset applied: ${name}`);
  }

  function resetPaper() {
    setPaper(initPaperState());
    setLogLines([]);
    pushLog("paper account reset — $1,000 starting equity");
  }

  function toggleRun() {
    if (paper.halted) return;
    setRunning((r) => !r);
    pushLog(running ? "stopped" : "started");
  }

  const dirLabel = target === 1 ? "LONG" : target === -1 ? "SHORT" : "FLAT";
  const dirClass = target === 1 ? "long" : target === -1 ? "short" : "flat";
  const pnl = paper.cash + paper.size * (mid ?? 0) - paper.startEquity;
  const equity = paper.cash + paper.size * (mid ?? 0);
  const posUsd = paper.size * (mid ?? 0);
  const posFrac = Math.min(Math.abs(posUsd) / Math.max(config.maxPositionUsd, 1), 1);
  const equityFlash = useFlash(equity);
  const pnlFlash = useFlash(pnl);

  return (
    <div className="wrap">
      <div className="top">
        <div className="brand">
          <span className="dot-live" />
          <h1>Hyperliquid EMA Bot</h1>
        </div>
        <div className="header-actions">
          <span className={`pill ${running ? "running" : "stopped"}`}>{running ? "LIVE — PAPER" : "STOPPED"}</span>
          <Link href="/changelog" className="nav-link">Patch notes</Link>
          <ThemeWheel />
        </div>
      </div>
      <div className="sub">
        EMA({config.fastEma}/{config.slowEma}) crossover on {config.symbol} · neutral band{" "}
        {(config.neutralBand * 100).toFixed(3)}% · poll every {config.pollSeconds}s
      </div>

      <div className="banner">
        <strong>Paper trading simulation — no real funds, no exchange keys.</strong>{" "}
        Reads live public Hyperliquid market data and runs the exact same EMA-crossover signal,
        position-sizing, and kill-switch logic as the original <code>hyperliquid-bot</code> Python bot,
        against a simulated $1,000 paper account stored only in your browser.
      </div>

      <div className="hero">
        <div className="hero-price">
          <div className="label">{config.symbol} / USD</div>
          <div className="price">{mid !== null ? `$${mid.toFixed(2)}` : "—"}</div>
          <div className="meta">
            <span>Gap <b className={gap !== null && gap > 0 ? "pos" : gap !== null && gap < 0 ? "neg" : ""}>{gap !== null ? `${(gap * 100).toFixed(3)}%` : "—"}</b></span>
            <span>Signal <span className={`pill ${dirClass}`}>{dirLabel}</span></span>
          </div>
        </div>
        <div className="grid">
          <div className="card">
            <div className="label">Position</div>
            <div className="value">{fmtUsd(posUsd)}</div>
            <div className="meter">
              <div className="zero" />
              <div
                className={`fill ${posUsd >= 0 ? "long" : "short"}`}
                style={{
                  width: `${(posFrac * 50).toFixed(1)}%`,
                  left: posUsd >= 0 ? "50%" : `${50 - posFrac * 50}%`,
                }}
              />
            </div>
          </div>
          <div className="card">
            <div className="label">Equity</div>
            <div
              key={fmtUsd(equity)}
              className={`value ${equityFlash ? `value-flash-${equityFlash}` : ""}`}
            >
              {fmtUsd(equity)}
            </div>
          </div>
          <div className="card">
            <div className="label">Session PnL</div>
            <div
              key={fmtUsd(pnl)}
              className={`value ${pnl >= 0 ? "pos" : "neg"} ${pnlFlash ? `value-flash-${pnlFlash}` : ""}`}
            >
              {fmtUsd(pnl)}
            </div>
          </div>
          <div className="card">
            <div className="label">Trades</div>
            <div className="value">{paper.trades}</div>
          </div>
        </div>
      </div>

      <PriceChart closes={closes} fast={config.fastEma} slow={config.slowEma} />

      <div className="panel">
        <h2>Config</h2>
        <div className="controls-grid">
          <div>
            <label>Symbol</label>
            <select
              value={config.symbol}
              disabled={running}
              onChange={(e) => setConfig((c) => ({ ...c, symbol: e.target.value }))}
            >
              {["ETH", "BTC", "SOL", "ARB", "DOGE"].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label>Interval</label>
            <select
              value={config.interval}
              disabled={running}
              onChange={(e) => setConfig((c) => ({ ...c, interval: e.target.value }))}
            >
              {["1m", "5m", "15m", "1h"].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label>Fast EMA</label>
            <input type="number" value={config.fastEma} disabled={running}
              onChange={(e) => setConfig((c) => ({ ...c, fastEma: Number(e.target.value) }))} />
          </div>
          <div>
            <label>Slow EMA</label>
            <input type="number" value={config.slowEma} disabled={running}
              onChange={(e) => setConfig((c) => ({ ...c, slowEma: Number(e.target.value) }))} />
          </div>
          <div>
            <label>Neutral band</label>
            <input type="number" step="0.0001" value={config.neutralBand} disabled={running}
              onChange={(e) => setConfig((c) => ({ ...c, neutralBand: Number(e.target.value) }))} />
          </div>
          <div>
            <label>Poll seconds</label>
            <input type="number" value={config.pollSeconds} disabled={running}
              onChange={(e) => setConfig((c) => ({ ...c, pollSeconds: Number(e.target.value) }))} />
          </div>
          <div>
            <label>Max position $</label>
            <input type="number" value={config.maxPositionUsd} disabled={running}
              onChange={(e) => setConfig((c) => ({ ...c, maxPositionUsd: Number(e.target.value) }))} />
          </div>
          <div>
            <label>Daily max loss $</label>
            <input type="number" value={config.dailyMaxLossUsd} disabled={running}
              onChange={(e) => setConfig((c) => ({ ...c, dailyMaxLossUsd: Number(e.target.value) }))} />
          </div>
          <div>
            <label>Min order $</label>
            <input type="number" value={config.minOrderUsd} disabled={running}
              onChange={(e) => setConfig((c) => ({ ...c, minOrderUsd: Number(e.target.value) }))} />
          </div>
          <div>
            <label>Leverage (display)</label>
            <input type="number" value={config.leverage} disabled={running}
              onChange={(e) => setConfig((c) => ({ ...c, leverage: Number(e.target.value) }))} />
          </div>
        </div>

        <div className="row">
          <button className="preset" disabled={running} onClick={() => applyPreset("normal")}>Normal mode</button>
          <button className="preset" disabled={running} onClick={() => applyPreset("fast")}>Fast mode</button>
          <button className="preset crazy" disabled={running} onClick={() => applyPreset("crazy")}>Crazy mode 🔥</button>
          <span style={{ flex: 1 }} />
          {paper.halted && <span className="pill halted">HALTED — {paper.haltReason}</span>}
          <button className={running ? "stop" : "primary"} disabled={paper.halted} onClick={toggleRun}>
            {running ? "Stop" : "Start"}
          </button>
          <button onClick={resetPaper}>Reset paper account</button>
        </div>
      </div>

      <div className="panel">
        <h2>Log</h2>
        <div className="log" ref={logRef}>
          {logLines.length === 0 && <div className="line">Press Start to begin polling live market data…</div>}
          {logLines.map((l, i) => (
            <div key={i} className={`line ${lineClass(l)}`}>
              [{new Date(l.ts).toLocaleTimeString()}] {l.text}
            </div>
          ))}
        </div>
      </div>

      <footer>
        Mirrors <code>hyperliquid-bot</code> (EMA crossover, position clamp, min-order filter, session kill-switch).
        Paper fills use a 0.045% taker fee + 0.05% slippage model, same as the original dry-run simulator. State is
        stored only in this browser (localStorage) — nothing is sent anywhere except public Hyperliquid market data
        requests.
      </footer>
    </div>
  );
}
