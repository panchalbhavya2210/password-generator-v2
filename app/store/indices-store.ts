import { create } from "zustand";

// ---------- Advance / Decline ----------
export interface AdvanceDecline {
  declines: string; // NSE sends as string
  advances: string;
  unchanged: string;
}

// ---------- Data Array ----------
export type NiftyDataItem = IndexSummary | EquityStock;

// ---------- 1️⃣ Index Object (priority: 1) ----------
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
}

// ---------- 2️⃣ Stock Object (priority: 0) ----------
export interface EquityStock {
  priority: 0;
  symbol: string;
  identifier: string;
  series: string;

  open: number;
  dayHigh: number;
  dayLow: number;
  last: number;
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
export interface NiftyIndexResponse {
  name: string;
  advance: AdvanceDecline;
  timestamp: string;
  metadata: NiftyDataItem;
}
export interface IndicesStore {
  indices: Record<string, NiftyIndexResponse>;
  loading: Record<string, boolean>;
  error: Record<string, string | null>;

  fetchIndex: (index: string) => Promise<void>;
}

export const useIndicesStore = create<IndicesStore>((set, get) => ({
  indices: {},
  loading: {},
  error: {},

  fetchIndex: async (index: string) => {
    const decoded = decodeURIComponent(index);

    if (get().indices[decoded]) return;
    const filterOutSpecifiIndex = ["NIFTY 50"];
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
        loading: { ...state.loading, [decoded]: false },
      }));
    } catch (e) {
      set((state) => ({
        loading: { ...state.loading, [decoded]: false },
        error: { ...state.error, [decoded]: "NSE blocked or failed" },
      }));
    }
  },
}));
