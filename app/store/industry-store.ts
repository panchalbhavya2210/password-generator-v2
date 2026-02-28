import { create } from "zustand";

export interface AllIndices {
  key: string;
  index: string;
  indexSymbol: string;
  last: number;
  variation: number;
  percentChange: number;
  open: number;
  high: number;
  low: number;
  previousClose: number;
  yearHigh: number;
  yearLow: number;
  indicativeClose: number;
  pe: string;
  pb: string;
  dy: string;
  declines: number;
  advances: number;
  unchanged: string;
  perChange365d: number;
  perChange30d: number;
  date365dAgo: string;
  date30dAgo: string;
  previousDay: string;
  oneWeekAgo: string;
  oneMonthAgoVal: number;
  oneWeekAgoVal: number;
  oneYearAgoVal: number;
  previousDayVal: number;
  chart365dPath: string;
  chart30dPath: string;
  chartTodayPath: string;
}

export interface Index {
  key: string;
  index: string;
  indexSymbol: string;
  last: number;
  variation: number;
  percentChange: number;
  open: number;
  high: number;
  low: number;
  previousClose: number;
  yearHigh: number;
  yearLow: number;
  indicativeClose: number;
  pe: string;
  pb: string;
  dy: string;
  declines: number;
  advances: number;
  unchanged: string;
  perChange365d: number;
  perChange30d: number;
}

interface IndustryStore {
  indices: Index[];
  setIndices: (data: Index[]) => void;
}

export const useIndustryStore = create<IndustryStore>((set) => ({
  indices: [],
  setIndices: (data) => set({ indices: data }),
}));
