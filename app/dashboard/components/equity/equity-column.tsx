"use client";

import {
  EquityStock,
  IndicesStore,
  NiftyDataItem,
} from "@/app/store/indices-store";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { ToolTipAsComp } from "../industry/industry-colums";

const columnHelper = createColumnHelper<NiftyDataItem>();

function isEquity(row: NiftyDataItem): row is EquityStock {
  return row.priority === 0;
}

export const EquityColums = [
  columnHelper.accessor("symbol", {
    header: "Symbol",
    cell: (info) => {
      const row = info.row.original;
      if (isEquity(row)) {
        return (
          <div>
            <div className="font-medium">{row.symbol}</div>
          </div>
        );
      }
      return <b>{row.symbol}</b>;
    },
  }),
  columnHelper.accessor("lastPrice", {
    header: "LTP",
    cell: (info) => {
      const value: number = Number(info.getValue());
      return `₹${value.toLocaleString("en-IN", {
        maximumFractionDigits: 2,
      })}`;
    },
  }),
  columnHelper.display({
    id: "change",
    header: "Change",
    cell: (info) => {
      const row = info.row.original;

      const positive = row.change > 0;

      return (
        <div className={positive ? "text-green-600" : "text-red-600"}>
          <div>{row.change.toFixed(2)}</div>
          <div className="text-xs">({row.pChange.toFixed(2)}%)</div>
        </div>
      );
    },
  }),
  columnHelper.accessor("totalTradedVolume", {
    header: "Volume",
    cell: (info) => info.getValue().toLocaleString("en-IN"),
  }),
  columnHelper.display({
    id: "52w",
    header: "52W H/L",
    cell: (info) => {
      const row = info.row.original;

      return (
        <div className="text-xs">
          <div>H: {row.yearHigh}</div>
          <div>L: {row.yearLow}</div>
        </div>
      );
    },
  }),
];
