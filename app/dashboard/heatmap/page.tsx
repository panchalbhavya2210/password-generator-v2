"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import {
  RefreshCw,
  TrendingDown,
  Minus,
  ArrowLeft,
  Search,
  BarChart3,
} from "lucide-react";
import {
  useHeatmapStore,
  formatHeatmapValue,
  startHeatmapPolling,
  stopHeatmapPolling,
  type HeatmapCategory,
  type HeatmapItem,
} from "@/app/store/heatmap-store";

const CATEGORIES: HeatmapCategory[] = [
  "Broad Market Indices",
  "Sectoral Indices",
  "Thematic Indices",
  "Strategy Indices",
];

function lerp(a: number, b: number, t: number): number {
  return Math.round(a + (b - a) * t);
}

function getTileColor(pChange: number): string {
  const clamped = Math.max(-5, Math.min(5, pChange));
  if (clamped > 0) {
    const t = clamped / 5;
    if (t <= 0.2) { const s = t / 0.2; return `rgb(${lerp(220, 120, s)},${lerp(240, 200, s)},${lerp(225, 130, s)})`; }
    if (t <= 0.5) { const s = (t - 0.2) / 0.3; return `rgb(${lerp(120, 40, s)},${lerp(200, 175, s)},${lerp(130, 70, s)})`; }
    const s = (t - 0.5) / 0.5; return `rgb(${lerp(40, 16, s)},${lerp(175, 140, s)},${lerp(70, 50, s)})`;
  }
  if (clamped < 0) {
    const t = Math.abs(clamped) / 5;
    if (t <= 0.2) { const s = t / 0.2; return `rgb(${lerp(230, 215, s)},${lerp(180, 120, s)},${lerp(175, 110, s)})`; }
    if (t <= 0.5) { const s = (t - 0.2) / 0.3; return `rgb(${lerp(215, 210, s)},${lerp(120, 65, s)},${lerp(110, 55, s)})`; }
    const s = (t - 0.5) / 0.5; return `rgb(${lerp(210, 170, s)},${lerp(65, 30, s)},${lerp(55, 25, s)})`;
  }
  return "rgb(170,170,175)";
}

function textColorFor(bg: string): string {
  const m = bg.match(/rgb\((\d+),(\d+),(\d+)\)/);
  if (!m) return "#fff";
  const [r, g, b] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const lum = 0.2126 * (r / 255) ** 2.2 + 0.7152 * (g / 255) ** 2.2 + 0.0722 * (b / 255) ** 2.2;
  return lum > 0.4 ? "#111" : "#fff";
}

function toTradingViewSymbol(label: string): string {
  const s = label.trim().replace(/\s+/g, "");
  return `NSE%3A${encodeURIComponent(s)}`;
}

function miniSparkline(pChange: number, w = 36, h = 16) {
  const mid = h / 2;
  const up = pChange >= 0;
  const peak = up ? 2 : h - 2;
  const trough = up ? h - 2 : 2;
  const pts = [
    `0,${mid}`,
    `${w * 0.15},${up ? trough : peak}`,
    `${w * 0.3},${mid}`,
    `${w * 0.45},${up ? peak : trough}`,
    `${w * 0.6},${mid}`,
    `${w * 0.75},${up ? trough : peak}`,
    `${w * 0.9},${mid}`,
    `${w},${mid}`,
  ];
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="opacity-60">
      <polyline
        points={pts.join(" ")}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function useTooltipPosition(ref: React.RefObject<HTMLElement | null>) {
  const [pos, setPos] = useState<"top" | "bottom">("top");
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      const rect = el.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      setPos(spaceBelow < 200 ? "top" : "bottom");
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);
  return pos;
}

function Tooltip({
  children,
  open,
  parentRef,
}: {
  children: React.ReactNode;
  open: boolean;
  parentRef: React.RefObject<HTMLElement | null>;
}) {
  const pos = useTooltipPosition(parentRef);

  return open ? (
    <div
      className={`absolute left-1/2 -translate-x-1/2 z-50 pointer-events-none ${
        pos === "top" ? "bottom-full mb-1.5" : "top-full mt-1.5"
      }`}
    >
      <div className="bg-[#1a1a1a] text-white border border-[#333] rounded-lg shadow-2xl p-3.5 min-w-[190px]">
        {children}
      </div>
    </div>
  ) : null;
}

function ChartButton({
  symbol,
  fg,
}: {
  symbol: string;
  fg: string;
}) {
  const tvSymbol = toTradingViewSymbol(symbol);
  const href = `https://in.tradingview.com/chart/?symbol=${tvSymbol}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      className="absolute top-1 right-1 flex items-center justify-center w-5 h-5 rounded hover:bg-black/10 transition-colors"
      title="Open TradingView chart"
    >
      <BarChart3 size={11} style={{ color: fg }} />
    </a>
  );
}

function IndexTile({ item }: { item: HeatmapItem }) {
  const [hovered, setHovered] = useState(false);
  const tileRef = useRef<HTMLDivElement>(null);
  const bg = getTileColor(item.pChange);
  const fg = textColorFor(bg);

  return (
    <div
      ref={tileRef}
      className="group relative flex flex-col justify-center cursor-pointer select-none border-b border-r border-white/10 transition-shadow duration-200 hover:z-10"
      style={{ backgroundColor: bg, minHeight: 110 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <a
        href={`https://in.tradingview.com/chart/?symbol=${toTradingViewSymbol(item.index)}`}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="absolute top-1 right-1 flex items-center justify-center w-5 h-5 rounded hover:bg-black/10 transition-colors"
        title="Open TradingView chart"
      >
        <BarChart3 size={11} style={{ color: fg }} />
      </a>
      <div className="flex flex-col items-center justify-center gap-0.5 px-2 py-3">
        <span
          className="text-xs font-semibold uppercase tracking-wider text-center leading-tight max-w-full"
          style={{ color: fg }}
        >
          {item.index}
        </span>
        <span
          className="text-xl font-extrabold tracking-tight mt-0.5"
          style={{ color: fg }}
        >
          {formatHeatmapValue(item.current)}
        </span>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span
            className="text-xs font-bold"
            style={{ color: fg }}
          >
            {item.pChange > 0 ? "+" : ""}
            {item.pChange.toFixed(2)}%
          </span>
          {miniSparkline(item.pChange)}
        </div>
      </div>

      <Tooltip open={hovered} parentRef={tileRef}>
        <div className="text-xs font-semibold mb-2 pb-1.5 border-b border-[#333]">
          {item.indexLongName}
        </div>
        <div className="space-y-1 text-xs">
          {[
            ["Current", formatHeatmapValue(item.current)],
            ["Open", formatHeatmapValue(item.open)],
            ["High", formatHeatmapValue(item.high)],
            ["Low", formatHeatmapValue(item.low)],
          ].map(([label, val]) => (
            <div key={label} className="flex justify-between gap-8">
              <span className="text-[#999]">{label}</span>
              <span className="font-medium">{val}</span>
            </div>
          ))}
        </div>
      </Tooltip>
    </div>
  );
}

function StockTile({ item }: { item: Record<string, unknown> }) {
  const [hovered, setHovered] = useState(false);
  const tileRef = useRef<HTMLDivElement>(null);
  const symbol = String(item.symbol ?? item.index ?? "");
  const pChange = Number(item.pChange ?? 0);
  const lastPrice = Number(item.last ?? item.lastPrice ?? item.ltp ?? item.close ?? 0);
  const bg = getTileColor(pChange);
  const fg = textColorFor(bg);

  return (
    <div
      ref={tileRef}
      className="group relative flex flex-col justify-center cursor-pointer select-none border-b border-r border-white/10 transition-shadow duration-200 hover:z-10"
      style={{ backgroundColor: bg, minHeight: 110 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <a
        href={`https://in.tradingview.com/chart/?symbol=${toTradingViewSymbol(symbol)}`}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="absolute top-1 right-1 flex items-center justify-center w-5 h-5 rounded hover:bg-black/10 transition-colors"
        title="Open TradingView chart"
      >
        <BarChart3 size={11} style={{ color: fg }} />
      </a>
      <div className="flex flex-col items-center justify-center gap-0.5 px-2 py-3">
        <span
          className="text-xs font-semibold uppercase tracking-wider text-center leading-tight max-w-full"
          style={{ color: fg }}
        >
          {symbol}
        </span>
        <span
          className="text-xl font-extrabold tracking-tight mt-0.5"
          style={{ color: fg }}
        >
          {formatHeatmapValue(lastPrice)}
        </span>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-xs font-bold" style={{ color: fg }}>
            {pChange > 0 ? "+" : ""}
            {pChange.toFixed(2)}%
          </span>
          {miniSparkline(pChange)}
        </div>
      </div>

      <Tooltip open={hovered} parentRef={tileRef}>
        <div className="text-xs font-semibold mb-2 pb-1.5 border-b border-[#333]">
          {symbol}
        </div>
        <div className="space-y-1 text-xs">
          {[
            ["Current", formatHeatmapValue(lastPrice)],
            ["Change", `${(Number(item.change ?? 0) >= 0 ? "+" : "")}${formatHeatmapValue(Number(item.change ?? 0))}`],
            ["VWAP", formatHeatmapValue(Number(item.vw ?? item.vwap ?? 0))],
            ["High", formatHeatmapValue(Number(item.high ?? 0))],
            ["Low", formatHeatmapValue(Number(item.low ?? 0))],
            ["Volume (L)", formatHeatmapValue(Number(item.totalTradedVolume ?? item.volume ?? 0))],
            ["Value (Cr)", formatHeatmapValue(Number(item.quantityTraded ?? item.value ?? 0))],
          ].map(([label, val]) => (
            <div key={label} className="flex justify-between gap-8">
              <span className="text-[#999]">{label}</span>
              <span className="font-medium">{val}</span>
            </div>
          ))}
        </div>
      </Tooltip>
    </div>
  );
}

function SegmentedControl({
  options,
  active,
  onChange,
}: {
  options: HeatmapCategory[];
  active: HeatmapCategory;
  onChange: (v: HeatmapCategory) => void;
}) {
  return (
    <div className="flex bg-muted rounded-lg p-0.5 gap-0.5">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-150 whitespace-nowrap ${
            active === opt
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

function MarketSummaryBar({ data }: { data: HeatmapItem[] }) {
  const total = data.length;
  const positive = data.filter((d) => d.pChange > 0).length;
  const negative = data.filter((d) => d.pChange < 0).length;
  const neutral = data.filter((d) => d.pChange === 0).length;

  const topGainer =
    data.length > 0
      ? data.reduce((a, b) => (a.pChange > b.pChange ? a : b))
      : null;
  const topLoser =
    data.length > 0
      ? data.reduce((a, b) => (a.pChange < b.pChange ? a : b))
      : null;

  return (
    <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
      <span className="font-semibold text-foreground">{total} indices</span>
      <span className="text-emerald-600 font-medium">+{positive}</span>
      <span className="text-red-500 font-medium">-{negative}</span>
      {neutral > 0 && <span className="text-muted-foreground">{neutral} flat</span>}
      <span className="w-px h-3 bg-border" />
      {topGainer && (
        <span>
          <span className="text-muted-foreground">High: </span>
          <span className="text-emerald-600 font-medium">
            {topGainer.index} {topGainer.pChange.toFixed(2)}%
          </span>
        </span>
      )}
      {topLoser && (
        <span>
          <span className="text-muted-foreground ml-2">Low: </span>
          <span className="text-red-500 font-medium">
            {topLoser.index} {topLoser.pChange.toFixed(2)}%
          </span>
        </span>
      )}
    </div>
  );
}

function HeatScale({ getColor }: { getColor: (v: number) => string }) {
  const steps = [-5, -3, -1, 0, 1, 3, 5];
  return (
    <div className="flex items-center rounded-md overflow-hidden h-5">
      {steps.map((v, i) => (
        <div
          key={v}
          className="flex items-center justify-center text-[9px] font-semibold min-w-[30px] h-full"
          style={{ backgroundColor: getColor(v), color: textColorFor(getColor(v)) }}
        >
          {v > 0 ? `+${v}` : v}
        </div>
      ))}
    </div>
  );
}

export default function HeatmapPage() {
  const data = useHeatmapStore((s) => s.data);
  const category = useHeatmapStore((s) => s.category);
  const loading = useHeatmapStore((s) => s.loading);
  const error = useHeatmapStore((s) => s.error);
  const lastUpdated = useHeatmapStore((s) => s.lastUpdated);
  const setCategory = useHeatmapStore((s) => s.setCategory);
  const fetchData = useHeatmapStore((s) => s.fetchData);
  const streaming = useHeatmapStore((s) => s.streaming);
  const toggleStreaming = useHeatmapStore((s) => s.toggleStreaming);

  const selectedIndex = useHeatmapStore((s) => s.selectedIndex);
  const stockData = useHeatmapStore((s) => s.stockData);
  const stockLoading = useHeatmapStore((s) => s.stockLoading);
  const stockError = useHeatmapStore((s) => s.stockError);
  const selectIndex = useHeatmapStore((s) => s.selectIndex);
  const fetchSymbols = useHeatmapStore((s) => s.fetchSymbols);

  const [query, setQuery] = useState("");

  const fetchedRef = useRef(false);

  useEffect(() => {
    if (!fetchedRef.current) {
      fetchedRef.current = true;
      fetchData();
    }
  }, []);

  useEffect(() => {
    if (streaming) {
      startHeatmapPolling();
    } else {
      stopHeatmapPolling();
    }
    return () => stopHeatmapPolling();
  }, [streaming]);

  const filtered = useMemo(
    () =>
      query.trim()
        ? data.filter((d) =>
            d.index.toLowerCase().includes(query.toLowerCase()),
          )
        : data,
    [data, query],
  );

  const mapData = selectedIndex ? stockData : filtered;
  const mapLoading = selectedIndex ? stockLoading : loading;
  const mapError = selectedIndex ? stockError : error;
  const isStockView = !!selectedIndex;

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-3 px-4 py-2.5 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-20 flex-wrap">
        {isStockView && (
          <button
            onClick={() => selectIndex(null)}
            className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Back</span>
          </button>
        )}

        <div className="flex items-center gap-2 font-semibold text-sm whitespace-nowrap">
          {isStockView ? selectedIndex : "Market Heatmap"}
          <span className="text-muted-foreground font-normal text-xs">
            ({mapData.length})
          </span>
        </div>

        {!isStockView && (
          <SegmentedControl
            options={CATEGORIES}
            active={category}
            onChange={setCategory}
          />
        )}

        {!isStockView && data.length > 0 && (
          <>
            <span className="w-px h-4 bg-border" />
            <MarketSummaryBar data={data} />
          </>
        )}

        <div className="flex items-center gap-2 ml-auto">
          {!isStockView && (
            <div className="relative">
              <Search size={13} className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                placeholder="Filter indices..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="h-7 w-[160px] rounded-md border bg-transparent pl-7 pr-2 text-xs outline-none focus:border-ring focus:ring-1 focus:ring-ring/30 transition-colors placeholder:text-muted-foreground/60"
              />
            </div>
          )}

          <HeatScale getColor={getTileColor} />

          <span className="w-px h-4 bg-border" />

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            Live
            <button
              onClick={toggleStreaming}
              className={`relative inline-flex h-4 w-7 shrink-0 cursor-pointer rounded-full border transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 ${
                streaming ? "bg-emerald-500 border-emerald-500" : "bg-input border-border"
              }`}
              role="switch"
              aria-checked={streaming}
            >
              <span
                className={`pointer-events-none block h-3 w-3 rounded-full bg-white shadow ring-0 transition-transform duration-200 ${
                  streaming ? "translate-x-[14px]" : "translate-x-px"
                }`}
              />
            </button>
          </div>

          <span className="w-px h-4 bg-border" />

          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {lastUpdated ? lastUpdated : "—"}
          </span>

          <button
            onClick={isStockView ? () => fetchSymbols() : fetchData}
            disabled={mapLoading}
            className="flex items-center justify-center h-7 w-7 rounded-md hover:bg-muted transition-colors disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw
              size={13}
              className={mapLoading ? "animate-spin" : ""}
            />
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-auto">
        {mapLoading && mapData.length === 0 && (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))]">
            {Array.from({ length: 18 }).map((_, i) => (
              <div key={i} className="h-[110px] bg-muted/50 animate-pulse" />
            ))}
          </div>
        )}

        {mapError && !mapLoading && (
          <div className="flex items-center justify-center gap-2 text-destructive text-sm h-40">
            <TrendingDown size={16} />
            {mapError}
          </div>
        )}

        {!mapLoading && !mapError && mapData.length === 0 && (
          <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm h-40">
            <Minus size={16} />
            {isStockView ? "No stock data available" : query ? "No indices match your filter" : "No data available"}
          </div>
        )}

        {!mapLoading && !mapError && mapData.length > 0 && (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))]">
            {[...mapData]
              .sort((a: any, b: any) => {
                const aVal = Number(a.pChange ?? 0);
                const bVal = Number(b.pChange ?? 0);
                return aVal - bVal;
              })
              .map((item: any) =>
                isStockView ? (
                  <StockTile key={item.symbol ?? item.index} item={item} />
                ) : (
                  <div key={item.index} onClick={() => selectIndex(item.index)}>
                    <IndexTile item={item} />
                  </div>
                ),
              )}
          </div>
        )}
      </div>
    </div>
  );
}
