// @ts-nocheck
"use client";

import { Card } from "@/components/ui/card";
import {
  AreaSeries,
  CandlestickSeries,
  createChart,
  HistogramSeries,
  LineSeries,
  UTCTimestamp,
} from "lightweight-charts";
import { useEffect, useRef, useState } from "react";

function formatVolume(v: number) {
  if (v >= 1_000_000_000) return (v / 1_000_000_000).toFixed(2) + "B";
  if (v >= 1_000_000) return (v / 1_000_000).toFixed(2) + "M";
  if (v >= 1_000) return (v / 1_000).toFixed(2) + "K";
  return v.toString();
}

function calculateSMA(data: { time: number; value: number }[], period: number) {
  const result: { time: number; value: number }[] = [];
  let sum = 0;
  for (let i = 0; i < data.length; i++) {
    sum += data[i].value;
    if (i >= period) sum -= data[i - period].value;
    if (i >= period - 1)
      result.push({ time: data[i].time, value: sum / period });
  }
  return result;
}

function calculateEMA(data: { time: number; value: number }[], period: number) {
  const result: { time: number; value: number }[] = [];
  const k = 2 / (period + 1);
  let ema = data[0].value;
  for (let i = 0; i < data.length; i++) {
    ema = data[i].value * k + ema * (1 - k);
    result.push({ time: data[i].time, value: ema });
  }
  return result;
}

type DrawPoint = { time: number; price: number };
type Drawing =
  | { type: "trend"; p1: DrawPoint; p2: DrawPoint }
  | { type: "horizontal"; p1: DrawPoint };

export default function YahooChart({
  symbol,
  resolution = "1D",
  lookbackDays = 365,
}: {
  symbol: string;
  resolution?: string;
  lookbackDays?: number;
}) {
  const [ohlc, setOhlc] = useState<null | {
    open: number;
    high: number;
    low: number;
    close: number;
    time: number;
  }>(null);
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null);
  const [volume, setVolume] = useState<number | null>(null);
  const [maValues, setMaValues] = useState<{
    sma20?: number;
    sma50?: number;
    ema200?: number;
  } | null>(null);
  const [activeTool, setActiveTool] = useState<"trend" | "horizontal">("trend");

  const ref = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const toolRef = useRef<"trend" | "horizontal">("trend");

  // Keep toolRef in sync with state so canvas handlers see latest value
  useEffect(() => {
    toolRef.current = activeTool;
  }, [activeTool]);

  const chartRef = useRef<any>(null);
  const candleSeriesRef = useRef<any>(null);

  // Drawing state — all refs so event handlers always see current values
  const drawings = useRef<Drawing[]>([]);
  const isDrawing = useRef(false);
  const currentDraft = useRef<Drawing | null>(null);
  const lastCrosshair = useRef<DrawPoint | null>(null);

  /* ------------------------------------------------------------------ */
  /*  Chart setup                                                         */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    if (!ref.current) return;
    ref.current.innerHTML = "";

    const chart = createChart(ref.current, {
      layout: { background: { color: "#0b0f1900" }, textColor: "#d1d4dc" },
      grid: {
        vertLines: { color: "#1f293750" },
        horzLines: { color: "#1f293750" },
      },
      width: ref.current.clientWidth,
      height: 550,
      crosshair: {
        mode: 0,
        vertLine: { color: "#94a3b8", width: 1 },
        horzLine: { color: "#94a3b8", width: 1 },
      },
      rightPriceScale: { borderVisible: false },
      timeScale: { borderVisible: false },
    });

    chartRef.current = chart;

    // ── Volume ── give it an explicit named scale pinned to the bottom 25%
    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceScaleId: "volume",
      priceFormat: { type: "volume" },
      lastValueVisible: false,
      priceLineVisible: false,
      base: 0,
    });

    // Scale margins: volume occupies the bottom 25%, rest is empty above it
    volumeSeries.priceScale().applyOptions({
      scaleMargins: { top: 0.75, bottom: 0 },
    });

    // ── Candles ── leave room at bottom for volume
    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#22c55e",
      downColor: "#ef4444",
      wickUpColor: "#22c55e",
      wickDownColor: "#ef4444",
      borderVisible: false,
    });

    candleSeries.priceScale().applyOptions({
      scaleMargins: { top: 0.05, bottom: 0.3 },
    });

    candleSeriesRef.current = candleSeries;

    const areaSeries = chart.addSeries(AreaSeries, {
      lineColor: "transparent",
      topColor: "rgba(56,33,110,0.6)",
      bottomColor: "rgba(56,33,110,0.1)",
      crosshairMarkerVisible: false,
      lastValueVisible: false,
    });

    const sma20Series = chart.addSeries(LineSeries, {
      color: "#facc15",
      lineWidth: 2,
      priceLineVisible: false,
      lastValueVisible: false,
    });

    const sma50Series = chart.addSeries(LineSeries, {
      color: "#60a5fa",
      lineWidth: 2,
      priceLineVisible: false,
      lastValueVisible: false,
    });

    const ema200Series = chart.addSeries(LineSeries, {
      color: "#f472b6",
      lineWidth: 2,
      priceLineVisible: false,
      lastValueVisible: false,
    });

    function getCloses(data: any) {
      return data.t.map((t: number, i: number) => ({
        time: t,
        value: data.c[i],
      }));
    }

    let lastBarTime: number | null = null;
    let poller: NodeJS.Timeout;

    async function loadHistory() {
      const to = Math.floor(Date.now() / 1000);
      const from = to - lookbackDays * 86400;
      const res = await fetch(
        `/api/history?symbol=${symbol}&resolution=${resolution}&from=${from}&to=${to}`,
      );
      const data = await res.json();
      if (!data?.t?.length) return;

      const candles = data.t.map((t: number, i: number) => ({
        time: t,
        open: data.o[i],
        high: data.h[i],
        low: data.l[i],
        close: data.c[i],
      }));

      const volumes = data.t.map((t: number, i: number) => ({
        time: t,
        value: data.v[i],
        color: data.c[i] >= data.o[i] ? "#22c55e88" : "#ef444488",
      }));

      candleSeries.setData(candles);
      volumeSeries.setData(volumes);

      const closes = getCloses(data);
      sma20Series.setData(calculateSMA(closes, 20));
      sma50Series.setData(calculateSMA(closes, 50));
      ema200Series.setData(calculateEMA(closes, 200));

      areaSeries.setData(
        data.t.map((t: number, i: number) => ({ time: t, value: data.c[i] })),
      );
      lastBarTime = data.t[data.t.length - 1];
    }

    async function updateLastCandle() {
      if (!lastBarTime) return;
      const now = Math.floor(Date.now() / 1000);
      const res = await fetch(
        `/api/history?symbol=${symbol}&resolution=${resolution}&from=${lastBarTime - 86400}&to=${now}`,
      );
      const data = await res.json();
      if (!data?.t?.length) return;
      const i = data.t.length - 1;
      const bar = {
        time: data.t[i],
        open: data.o[i],
        high: data.h[i],
        low: data.l[i],
        close: data.c[i],
      };
      candleSeries.update(bar);
      areaSeries.update({ time: bar.time, value: bar.close });
      volumeSeries.update({
        time: bar.time,
        value: data.v[i],
        color: bar.close >= bar.open ? "#22c55e88" : "#ef444488",
      });
      lastBarTime = bar.time;
    }

    loadHistory().then(() => {
      poller = setInterval(updateLastCandle, 300000);
    });

    /* -------- Canvas drawing engine -------- */
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;

    function resizeCanvas() {
      const w = ref.current!.clientWidth;
      const h = ref.current!.clientHeight;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
      redraw();
    }

    function coordsForPoint(p: DrawPoint) {
      const x = chart.timeScale().timeToCoordinate(p.time as UTCTimestamp);
      const y = candleSeries.priceToCoordinate(p.price);
      return { x, y };
    }

    function drawTrend(p1: DrawPoint, p2: DrawPoint, color = "#22c55e") {
      const c1 = coordsForPoint(p1);
      const c2 = coordsForPoint(p2);
      if (c1.x == null || c2.x == null || c1.y == null || c2.y == null) return;
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(c1.x, c1.y);
      ctx.lineTo(c2.x, c2.y);
      ctx.stroke();
    }

    function drawHorizontal(p: DrawPoint, color = "#f59e0b") {
      const { y } = coordsForPoint(p);
      if (y == null) return;
      const w = ref.current!.clientWidth;
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    function redraw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Committed drawings
      for (const d of drawings.current) {
        if (d.type === "trend") drawTrend(d.p1, d.p2);
        else drawHorizontal(d.p1);
      }

      // Live draft
      if (isDrawing.current && currentDraft.current) {
        const d = currentDraft.current;
        if (d.type === "trend") drawTrend(d.p1, d.p2, "#22c55e99");
        else drawHorizontal(d.p1, "#f59e0b99");
      }
    }

    /* -------- Crosshair → update draft + OHLC tooltip -------- */
    chart.subscribeCrosshairMove((param) => {
      if (!param?.point || !param.time) {
        setOhlc(null);
        setCursor(null);
        setVolume(null);
        setMaValues(null);
        return;
      }

      const price = candleSeries.coordinateToPrice(param.point.y);
      if (price != null)
        lastCrosshair.current = { time: param.time as number, price };

      // Update draft second point while dragging
      if (isDrawing.current && lastCrosshair.current && currentDraft.current) {
        if (currentDraft.current.type === "trend") {
          (currentDraft.current as any).p2 = lastCrosshair.current;
        }
        // horizontal doesn't need update — it follows p1 on render
      }

      redraw();

      // Moving averages
      const sma20 = param.seriesData.get(sma20Series) as any;
      const sma50 = param.seriesData.get(sma50Series) as any;
      const ema200 = param.seriesData.get(ema200Series) as any;
      setMaValues({
        sma20: sma20?.value,
        sma50: sma50?.value,
        ema200: ema200?.value,
      });

      // Candle
      const candleData = param.seriesData.get(candleSeries) as any;
      if (!candleData) {
        setOhlc(null);
        setVolume(null);
        return;
      }
      setOhlc({
        open: candleData.open,
        high: candleData.high,
        low: candleData.low,
        close: candleData.close,
        time: candleData.time,
      });

      // Volume
      const volData = param.seriesData.get(volumeSeries) as any;
      setVolume(volData ? volData.value : null);

      // Tooltip position
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const tooltipWidth = 150;
      const tooltipHeight = 100;
      let x = param.point.x + 12;
      let y = param.point.y - tooltipHeight - 12;
      if (x > rect.width - tooltipWidth) x = rect.width - tooltipWidth;
      if (y < 0) y = param.point.y + 12;
      setCursor({ x, y });
    });

    /* -------- Mouse events on the chart container (not the canvas) -------- */
    const container = ref.current!;

    function onMouseDown(e: MouseEvent) {
      if (!lastCrosshair.current) return;
      isDrawing.current = true;
      const tool = toolRef.current;
      if (tool === "trend") {
        currentDraft.current = {
          type: "trend",
          p1: { ...lastCrosshair.current },
          p2: { ...lastCrosshair.current },
        };
      } else {
        currentDraft.current = {
          type: "horizontal",
          p1: { ...lastCrosshair.current },
        };
      }
    }

    function onMouseUp() {
      if (!isDrawing.current || !currentDraft.current) return;
      isDrawing.current = false;
      drawings.current = [...drawings.current, currentDraft.current];
      currentDraft.current = null;
      redraw();
    }

    container.addEventListener("mousedown", onMouseDown);
    container.addEventListener("mouseup", onMouseUp);

    // Resize
    const handleResize = () => {
      chart.applyOptions({ width: ref.current!.clientWidth });
      resizeCanvas();
    };
    window.addEventListener("resize", handleResize);
    resizeCanvas();

    return () => {
      window.removeEventListener("resize", handleResize);
      container.removeEventListener("mousedown", onMouseDown);
      container.removeEventListener("mouseup", onMouseUp);
      clearInterval(poller);
      chart.remove();
      chartRef.current = null;
      candleSeriesRef.current = null;
    };
  }, [symbol, resolution]);

  return (
    <div className="relative w-full h-[600px]">
      {/* Toolbar */}
      <div className="z-10 absolute top-2 left-2 flex gap-2">
        <button
          onClick={() => setActiveTool("trend")}
          className={`px-3 py-1 rounded text-xs font-mono border transition-colors ${
            activeTool === "trend"
              ? "bg-green-600 border-green-500 text-white"
              : "bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700"
          }`}
        >
          Trend
        </button>
        <button
          onClick={() => setActiveTool("horizontal")}
          className={`px-3 py-1 rounded text-xs font-mono border transition-colors ${
            activeTool === "horizontal"
              ? "bg-amber-600 border-amber-500 text-white"
              : "bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700"
          }`}
        >
          H-Line
        </button>
        <button
          onClick={() => {
            drawings.current = [];
          }}
          className="px-3 py-1 rounded text-xs font-mono border bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700"
        >
          Clear
        </button>
      </div>

      {/* Chart container — mouse events live here */}
      <div ref={ref} className="w-full h-full" />

      {/* Canvas sits on top for drawing, but pointer-events:none so chart crosshair still works */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
      />

      {volume && (
        <div className="absolute right-3 top-3 text-xs text-sky-400 font-mono">
          Vol {formatVolume(volume)}
        </div>
      )}

      {ohlc && cursor && (
        <Card
          className="gap-0 pointer-events-none absolute z-50 backdrop-blur-md text-sm text-white px-3 py-2 rounded-md border font-mono leading-5"
          style={{ left: cursor.x, top: cursor.y }}
        >
          <div className="text-gray-200">O {ohlc.open.toFixed(2)}</div>
          <div className="text-green-600">H {ohlc.high.toFixed(2)}</div>
          <div className="text-red-600">L {ohlc.low.toFixed(2)}</div>
          <div>
            C {ohlc.close.toFixed(2)}
            <span
              className={`ml-2 ${ohlc.close >= ohlc.open ? "text-green-400" : "text-red-400"}`}
            >
              {(((ohlc.close - ohlc.open) / ohlc.open) * 100).toFixed(2)}%
            </span>
          </div>
          {volume !== null && (
            <div className="text-sky-400">V {formatVolume(volume)}</div>
          )}
          {maValues && (
            <div className="mt-2 border-t border-slate-700 pt-2 space-y-1">
              {maValues.sma20 && (
                <div className="text-yellow-400">
                  SMA20 - {maValues.sma20.toFixed(2)}
                </div>
              )}
              {maValues.sma50 && (
                <div className="text-blue-400">
                  SMA50 - {maValues.sma50.toFixed(2)}
                </div>
              )}
              {maValues.ema200 && (
                <div className="text-pink-400">
                  EMA200 - {maValues.ema200.toFixed(2)}
                </div>
              )}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
