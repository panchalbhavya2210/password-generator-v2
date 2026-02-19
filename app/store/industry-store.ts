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

export const useIndustryStore = create<AllIndices>((set) => ({
  key: "",
  index: "",
  indexSymbol: "",
  last: 0,
  variation: 0,
  percentChange: 0,
  open: 0,
  high: 0,
  low: 0,
  previousClose: 0,
  yearHigh: 0,
  yearLow: 0,
  indicativeClose: 0,
  pe: "",
  pb: "",
  dy: "",
  declines: 0,
  advances: 0,
  unchanged: "",
  perChange365d: 0,
  perChange30d: 0,
  date365dAgo: "",
  date30dAgo: "",
  previousDay: "",
  oneWeekAgo: "",
  oneMonthAgoVal: 0,
  oneWeekAgoVal: 0,
  oneYearAgoVal: 0,
  previousDayVal: 0,
  chart365dPath: "",
  chart30dPath: "",
  chartTodayPath: "",
}));
