// @ts-nocheck
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { AllIndices } from "@/app/store/industry-store";

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
  console.log(total, "tot");
  if (total === 0) return { advancePct: 0, declinePct: 0 };
  console.log(advances, declines, unchanged, "fj");
  const advancePct = (advances / total) * 100;
  const declinePct = (declines / total) * 100;
  console.log(advancePct, declinePct);
  return {
    advancePct,
    declinePct,
  };
}

export const IndustryColums: ColumnDef<AllIndices>[] = [
  {
    accessorKey: "Sector",
    header: "Sector",
    cell: ({ row }) => (
      <div className="font-medium sticky left-0 bg-background pr-4">
        {row.original.indexSymbol}
      </div>
    ),
  },
  {
    accessorKey: "Number Of Companies",
    header: "Number Of Companies",
    cell: ({ row }) => (
      <div className="font-medium sticky left-0 bg-background pr-4">
        {parseInt(row.original.advances) + parseInt(row.original.declines)}
      </div>
    ),
  },
  {
    accessorKey: "Advance/Declines",
    header: "Advance/Declines",
    cell: ({ row }) => (
      <div className="font-medium sticky left-0 bg-background pr-4">
        {/* {
          (calculateAdvanceDecline(row.original.advances).advancePct,
          calculateAdvanceDecline(row.original.declines).declinePct)
        } */}
      </div>
    ),
  },
  {
    accessorKey: "percentChange",
    header: "1D Change",
    cell: ({ row }) =>
      valueCell(calcReturn(row.original.last, row.original.previousClose)),
  },
  {
    accessorKey: "oneWeekAgoVal",
    header: "1W Change",
    cell: ({ row }) =>
      valueCell(calcReturn(row.original.last, row.original.oneWeekAgoVal)),
  },
  {
    accessorKey: "oneMonthAgoVal",
    header: "1M Change",
    cell: ({ row }) =>
      valueCell(calcReturn(row.original.last, row.original.oneMonthAgoVal)),
  },
  {
    accessorKey: "oneYearAgoVal",
    header: "1Y Change",
    cell: ({ row }) =>
      valueCell(calcReturn(row.original.last, row.original.oneYearAgoVal)),
  },
  {
    accessorKey: "PE Ratio",
    header: "PE Ratio",
    cell: ({ row }) => (
      <div className="font-medium sticky left-0 bg-background pr-4">
        {row.original.pe}%
      </div>
    ),
  },
  {
    accessorKey: "PB",
    header: "PB",
    cell: ({ row }) => (
      <div className="font-medium sticky left-0 bg-background pr-4">
        {row.original.pb}
      </div>
    ),
  },
];
