import { create } from "zustand";
import { isMarketOpenNow } from "../lib/market-open";

export interface HeatmapItem {
  index: string;
  indexLongName: string;
  open: number;
  current: number;
  close: number;
  high: number;
  low: number;
  pChange: number;
  yrHigh: number;
  yrLow: number;
  timeStamp: string;
}

export interface HeatmapStockItem {
  symbol: string;
  pChange: number;
  ltp: number;
  change: number;
  open: number;
  high: number;
  low: number;
  close: number;
  vw: number;
  totalTradedVolume: number;
  quantityTraded: number;
}

const CATEGORIES = [
  "Broad Market Indices",
  "Sectoral Indices",
  "Thematic Indices",
  "Strategy Indices",
] as const;

export type HeatmapCategory = (typeof CATEGORIES)[number];

interface HeatmapStore {
  data: HeatmapItem[];
  category: HeatmapCategory;
  loading: boolean;
  error: string | null;
  streaming: boolean;
  lastUpdated: string | null;

  selectedIndex: string | null;
  stockData: Record<string, unknown>[];
  stockLoading: boolean;
  stockError: string | null;

  setCategory: (cat: HeatmapCategory) => void;
  toggleStreaming: () => void;
  fetchData: () => Promise<void>;
  selectIndex: (indexName: string | null) => void;
  fetchSymbols: () => Promise<void>;
}

export function getHeatmapColor(pChange: number): string {
  if (pChange >= 5) return "heatmap-tilecolor-five";
  if (pChange >= 3) return "heatmap-tilecolor-three";
  if (pChange >= 1) return "heatmap-tilecolor-one";
  if (pChange > -1 && pChange < 1) return "heatmap-tilecolor-zero";
  if (pChange <= -5) return "heatmap-tilecolor-negative-five";
  if (pChange <= -3) return "heatmap-tilecolor-negative-three";
  if (pChange <= -1) return "heatmap-tilecolor-negative-one";
  return "heatmap-tilecolor-zero";
}

export function formatHeatmapValue(value: number): string {
  return value.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export const useHeatmapStore = create<HeatmapStore>((set, get) => ({
  data: [],
  category: "Broad Market Indices",
  loading: false,
  error: null,
  streaming: false,
  lastUpdated: null,

  selectedIndex: null,
  stockData: [],
  stockLoading: false,
  stockError: null,

  setCategory: (cat) => {
    set({
      category: cat,
      data: [],
      error: null,
      selectedIndex: null,
      stockData: [],
      stockError: null,
    });
    get().fetchData();
  },

  toggleStreaming: () => {
    const next = !get().streaming;
    set({ streaming: next });
    if (next) {
      get().fetchData();
    }
  },

  fetchData: async () => {
    const { category } = get();
    try {
      set({ loading: true, error: null });
      const res = await fetch(
        `/api/heatmap-index?type=${encodeURIComponent(category)}`,
      );
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      const now = new Date().toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });
      set({
        data: Array.isArray(json) ? json : [],
        loading: false,
        lastUpdated: now,
      });
    } catch {
      set({ error: "Failed to load heatmap data", loading: false });
    }
  },

  selectIndex: (indexName) => {
    set({ selectedIndex: indexName, stockData: [], stockError: null });
    if (indexName) {
      get().fetchSymbols();
    }
  },

  fetchSymbols: async () => {
    const { category, selectedIndex } = get();
    if (!selectedIndex) return;
    try {
      set({ stockLoading: true, stockError: null });
      const res = await fetch(
        `/api/heatmap-symbols?type=${encodeURIComponent(category)}&indices=${encodeURIComponent(selectedIndex)}`,
      );
      if (!res.ok) throw new Error("Failed to fetch symbols");
      const json = await res.json();
      set({
        stockData: Array.isArray(json) ? json : [],
        stockLoading: false,
      });
    } catch {
      set({ stockError: "Failed to load stock data", stockLoading: false });
    }
  },
}));

let pollInterval: ReturnType<typeof setInterval> | null = null;

export function startHeatmapPolling() {
  const store = useHeatmapStore.getState();
  if (pollInterval) return;
  if (!store.streaming) return;
  if (!isMarketOpenNow()) return;
  store.fetchData();
  pollInterval = setInterval(() => {
    const s = useHeatmapStore.getState();
    if (!s.streaming) {
      stopHeatmapPolling();
      return;
    }
    if (!isMarketOpenNow()) return;
    s.fetchData();
    if (s.selectedIndex) {
      s.fetchSymbols();
    }
  }, 10_000);
}

export function stopHeatmapPolling() {
  if (pollInterval) {
    clearInterval(pollInterval);
    pollInterval = null;
  }
}
