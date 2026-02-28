"use client";

import { getNseIndexUrl } from "@/app/lib/getNSEIndex";
import { SectorTableRow } from "@/app/types/net-investment";
import { createColumnHelper } from "@tanstack/react-table";
import Link from "next/link";
import { valueCell } from "../fii/sector-columns";

const columnHelper = createColumnHelper<SectorTableRow>();

export const NetInvestmentColumns = [
  columnHelper.accessor("sector", {
    header: "Symbol",
    cell: (info) => {
      const label = info.getValue();
      const href = getNseIndexUrl(label);

      if (!href) return <div className="font-medium">{label}</div>;

      return (
        <Link href={href} className="font-medium text-primary hover:underline">
          {label}
        </Link>
      );
    },
  }),
  columnHelper.accessor("15D", {
    header: "15 Days",
    cell: ({ row }) => valueCell(row.getValue<number>("15D")),
  }),
  columnHelper.accessor("30D", {
    header: "1 Month",
    cell: ({ row }) => valueCell(row.getValue<number>("30D")),
  }),
  columnHelper.accessor("90D", {
    header: "3 Months",
    cell: ({ row }) => valueCell(row.getValue<number>("90D")),
  }),
  columnHelper.accessor("180D", {
    header: "6 Months",
    cell: ({ row }) => valueCell(row.getValue<number>("180D")),
  }),
  columnHelper.accessor("365D", {
    header: "1 Year",
    cell: ({ row }) => valueCell(row.getValue<number>("365D")),
  }),
];
