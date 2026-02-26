// @ts-nocheck
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { AllIndices } from "@/app/store/industry-store";
import { CircleQuestionMark } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function calcReturn(current: number, past: number) {
  if (!past || past === 0) return 0;
  const percent = parseFloat(((current - past) / past) * 100).toPrecision(2);
  return percent;
}

const valueCell = (value: number) => (
  <span
    className={`font-semibold ${
      value > 0
        ? "text-emerald-500"
        : value < 0
          ? "text-red-500"
          : "text-muted-foreground"
    }`}
  >
    {value}%
  </span>
);

function calculateAdvanceDecline(
  advances: Number,
  declines: Number,
  unchanged: Number = 0,
) {
  const total = parseInt(advances) + parseInt(declines);
  if (total === 0) return { advancePct: 0, declinePct: 0 };
  const advancePct = (advances / total) * 100;
  const declinePct = (declines / total) * 100;
  return {
    advancePct,
    declinePct,
  };
}

function ToolTipAsComp({ child }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <CircleQuestionMark
          size={14}
          className="text-muted-foreground cursor-help"
        />
      </TooltipTrigger>

      <TooltipContent side="top" className="max-w-[240px] text-xs">
        {child}
      </TooltipContent>
    </Tooltip>
  );
}

export const IndustryColums: ColumnDef<AllIndices>[] = [
  {
    id: "sector",
    accessorFn: (row) => row.index,
    header: () => (
      <div className="flex items-center gap-2">
        <span>Sector</span>
        <ToolTipAsComp
          child="Sector index representing grouped companies belonging to the same industry
      (IT, Banks, Auto, Pharma etc). Click a row to open detailed breadth and valuation."
        />
      </div>
    ),
    size: 180,
    minSize: 160,
    maxSize: 190,
    cell: ({ row }) => (
      <div className="font-medium sticky left-0 bg-background pr-4">
        {row.original.indexSymbol}
      </div>
    ),
  },
  {
    accessorKey: "LTP",
    header: () => (
      <div className="flex items-center gap-2">
        <span>LTP</span>
        <ToolTipAsComp child="Latest Traded Price (LTP): The real-time price of the most recent executed trade. It changes whenever a new buy-sell transaction occurs in the market and represents the current trading value, unlike the previous day’s closing price." />
      </div>
    ),
    size: 180,
    minSize: 160,
    maxSize: 190,
    cell: ({ row }) => (
      <div className="font-medium sticky left-0 bg-background pr-4">
        {row.original.last}
      </div>
    ),
  },
  {
    accessorKey: "PE Ratio",
    header: () => (
      <div className="flex items-center gap-2">
        <span>PE Ratio</span>
        <ToolTipAsComp child="Latest Traded Price (LTP): The real-time price of the most recent executed trade. It changes whenever a new buy-sell transaction occurs in the market and represents the current trading value, unlike the previous day’s closing price." />
      </div>
    ),
    size: 180,
    minSize: 160,
    maxSize: 190,
    cell: ({ row }) => (
      <div className="font-medium sticky left-0 bg-background pr-4">
        {row.original.pe}
      </div>
    ),
  },
  {
    accessorKey: "Advance/Declines",
    header: () => (
      <div className="flex items-center gap-2">
        <span>A/D</span>
        <ToolTipAsComp
          child="Advance/Decline Ratio - Market breadth indicator. Shows how many stocks in the sector are rising
        versus falling. Strong sectors have more advancing stocks."
        />
      </div>
    ),
    size: 170,
    minSize: 100,
    maxSize: 260,
    cell: ({ row }) => {
      const { advancePct, declinePct } = calculateAdvanceDecline(
        row.original.advances,
        row.original.declines,
      );

      return (
        <div className="w-full flex items-center gap-2 relative">
          <div className="w-full h-4 rounded overflow-hidden flex bg-muted">
            <div
              className="bg-emerald-500"
              style={{ width: `${advancePct}%` }}
            />
            <div className="bg-red-500" style={{ width: `${declinePct}%` }} />
          </div>
          <span className="text-xs font-semibold absolute top-[50%]  left-[5%] -translate-y-1/2 text-white">
            {row.original.advances}
          </span>
          <span className="text-xs font-semibold absolute top-[50%] right-[5%] -translate-y-1/2 text-white">
            {row.original.declines}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "percentChange",
    header: "1D",
    size: 110,
    minSize: 90,
    maxSize: 150,
    cell: ({ row }) =>
      valueCell(calcReturn(row.original.last, row.original.previousClose)),
  },
  {
    accessorKey: "oneWeekAgoVal",
    header: "1W",
    size: 110,
    minSize: 90,
    maxSize: 150,
    cell: ({ row }) =>
      valueCell(calcReturn(row.original.last, row.original.oneWeekAgoVal)),
  },
  {
    accessorKey: "oneMonthAgoVal",
    header: "1M",
    size: 110,
    minSize: 90,
    maxSize: 150,
    cell: ({ row }) =>
      valueCell(calcReturn(row.original.last, row.original.oneMonthAgoVal)),
  },
  {
    accessorKey: "oneYearAgoVal",
    header: "1Y",
    size: 110,
    minSize: 90,
    maxSize: 150,
    cell: ({ row }) =>
      valueCell(calcReturn(row.original.last, row.original.oneYearAgoVal)),
  },
];
