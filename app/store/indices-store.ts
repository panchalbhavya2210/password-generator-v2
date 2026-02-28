import { create } from "zustand";
import { isMarketOpenNow } from "../lib/market-open";
import { createJSONStorage, persist } from "zustand/middleware";

export interface AdvanceDecline {
  declines: string;
  advances: string;
  unchanged: string;
}

// ---------- Data Array ----------
export type NiftyDataItem =
  | (IndexSummary & { priority: 1 })
  | (EquityStock & { priority: 0 });

export interface IndexSummary {
  priority: 1;
  symbol: string;
  identifier: string;

  open: number;
  dayHigh: number;
  dayLow: number;
  last: number;
  previousClose: number;

  change: number;
  pChange: number;

  ffmc: number;

  yearHigh: number;
  yearLow: number;

  totalTradedVolume: number;
  stockIndClosePrice: number;
  totalTradedValue: number;

  lastUpdateTime: string;

  nearWKH: number;
  nearWKL: number;

  perChange365d: number;
  perChange30d: number;

  date365dAgo: string;
  date30dAgo: string;

  chartTodayPath: string;
  chart30dPath: string;
  chart365dPath: string;

  unchanged: number;
}

export interface EquityStock {
  priority: 0;
  symbol: string;
  identifier: string;
  series: string;

  open: number;
  dayHigh: number;
  dayLow: number;
  lastPrice: number;
  previousClose: number;

  change: number;
  pChange: number;

  totalTradedVolume: number;
  stockIndClosePrice: number;
  totalTradedValue: number;

  yearHigh: number;
  yearLow: number;

  ffmc: number;

  nearWKH: number;
  nearWKL: number;

  perChange365d: number;
  perChange30d: number;

  date365dAgo: string;
  date30dAgo: string;

  chartTodayPath: string;
  chart30dPath: string;
  chart365dPath: string;

  meta: EquityMeta;

  unchanged: number;
}

// ---------- Meta ----------
export interface EquityMeta {
  symbol: string;
  companyName: string;
  industry: string;

  activeSeries: string[];
  debtSeries: string[];

  isFNOSec: boolean;
  isCASec: boolean;
  isSLBSec: boolean;
  isDebtSec: boolean;
  isSuspended: boolean;
  tempSuspendedSeries: string[];
  isETFSec: boolean;
  isDelisted: boolean;

  isin: string;
  slb_isin: string;

  listingDate: string;

  isMunicipalBond: boolean;
  isHybridSymbol: boolean;

  segment: string;

  quotepreopenstatus: QuotePreOpenStatus;
}

// ---------- Pre-open ----------
export interface QuotePreOpenStatus {
  equityTime: string;
  preOpenTime: string;
  QuotePreOpenFlag: boolean;
}
// ---------- Root ----------
export interface IndexMetadata {
  symbol: string;
  identifier: string;
  open: number;
  dayHigh: number;
  dayLow: number;
  last: number;
  previousClose: number;
  change: number;
  pChange: number;
  ffmc: number;
  yearHigh: number;
  yearLow: number;
  unchanged: number;
}
export interface NiftyIndexResponse {
  name: string;
  advance: AdvanceDecline;
  timestamp: string;

  data: NiftyDataItem[];
  metadata: IndexMetadata;
}
export interface IndicesStore {
  indices: Record<string, NiftyIndexResponse>;
  loading: Record<string, boolean>;
  error: Record<string, string | null>;
  lastFetched: Record<string, number>;
  fetchIndex: (index: string) => Promise<void>;
}

export function shouldUseCache(lastFetched?: number) {
  if (!lastFetched) return false;

  // weekend or after hours
  if (!isMarketOpenNow()) return true;

  // during live market → 1 min cache
  const age = Date.now() - lastFetched;
  return age < 60_000;
}

export const useIndicesStore = create<IndicesStore>()(
  persist(
    (set, get) => ({
      indices: {},
      loading: {},
      error: {},
      lastFetched: {},

      /* -------- FETCH FUNCTION -------- */

      fetchIndex: async (index: string) => {
        const decoded = decodeURIComponent(index);
        const state = get();

        // 1️⃣ Cache Check (MOST IMPORTANT)
        if (shouldUseCache(state.lastFetched[decoded])) return;

        // Prevent parallel fetches
        if (state.loading[decoded]) return;

        try {
          set((state) => ({
            loading: { ...state.loading, [decoded]: true },
            error: { ...state.error, [decoded]: null },
          }));

          const res = await fetch(
            `/api/equityIndice/${encodeURIComponent(decoded)}`,
          );

          if (!res.ok) throw new Error("Fetch failed");

          const json: NiftyIndexResponse = await res.json();

          set((state) => ({
            indices: { ...state.indices, [decoded]: json },
            lastFetched: { ...state.lastFetched, [decoded]: Date.now() },
            loading: { ...state.loading, [decoded]: false },
          }));
        } catch (e) {
          set((state) => ({
            loading: { ...state.loading, [decoded]: false },
            error: { ...state.error, [decoded]: "NSE blocked or failed" },
          }));
        }
      },

      /* -------- MANUAL CACHE CLEAR -------- */

      clearCache: () =>
        set({
          indices: {},
          lastFetched: {},
          error: {},
        }),
    }),
    {
      name: "indices-cache",

      // critical for Next.js (prevents hydration crash)
      storage: createJSONStorage(() => localStorage),

      // do NOT persist loading state
      partialize: (state) => ({
        indices: state.indices,
        lastFetched: state.lastFetched,
        error: state.error,
      }),
    },
  ),
);
