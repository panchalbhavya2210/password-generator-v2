"use client";

import { ColumnDef } from "@tanstack/react-table";
import { SectorFlow } from "@/app/types/sector";
import Link from "next/link";
import { getNseIndexUrl } from "@/app/lib/getNSEIndex";

export const format = (v: number) =>
  `₹${v.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

export const valueCell = (value: number) => (
  <span
    className={`font-semibold ${
      value > 0
        ? "text-emerald-500"
        : value < 0
          ? "text-red-500"
          : "text-muted-foreground"
    }`}
  >
    {format(value)}
  </span>
);

export const sectorColumns: ColumnDef<SectorFlow>[] = [
  {
    accessorKey: "Sector",
    header: "Sector",
    cell: (info) => {
      const label = info.row.original.Sector;
      const href = getNseIndexUrl(label);

      if (!href) return <div className="font-medium">{label}</div>;

      return (
        <Link href={href} className="font-medium text-primary hover:underline">
          {label}
        </Link>
      );
    },
  },

  {
    accessorKey: "15D",
    header: "15 Days",
    cell: ({ row }) => valueCell(row.getValue<number>("15D")),
  },
  {
    accessorKey: "30D",
    header: "1 Month",
    cell: ({ row }) => valueCell(row.getValue<number>("30D")),
  },
  {
    accessorKey: "90D",
    header: "3 Months",
    cell: ({ row }) => valueCell(row.getValue<number>("90D")),
  },
  {
    accessorKey: "180D",
    header: "6 Months",
    cell: ({ row }) => valueCell(row.getValue<number>("180D")),
  },
  {
    accessorKey: "360D",
    header: "1 Year",
    cell: ({ row }) => valueCell(row.getValue<number>("360D")),
  },
];
