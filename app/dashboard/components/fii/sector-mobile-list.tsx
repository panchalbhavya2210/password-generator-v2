"use client";

import { SectorFlow } from "@/app/types/sector";
import { calculateSectorMovers, Period } from "@/app/lib/sector-mover";
import { useMemo } from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

type Props = {
  data: SectorFlow[];
  period: Period;
};

import { SectorTableRow } from "@/app/types/net-investment";

function adaptTableRows(rows: SectorTableRow[]): SectorFlow[] {
  return rows.map((r) => ({
    Sector: r.sector,
    "15D": r["15D"],
    "30D": r["30D"],
    "90D": r["90D"],
    "180D": r["180D"],
    "360D": r["365D"],
  }));
}
function isTableRow(data: any[]): data is SectorTableRow[] {
  return data.length > 0 && "sector" in data[0];
}

export default function SectorMobileList({ data, period }: Props) {
  const movers = useMemo(() => {
    if (!data || data.length === 0) return [];

    const normalized: SectorFlow[] = isTableRow(data)
      ? adaptTableRows(data)
      : data;

    return calculateSectorMovers(normalized, period);
  }, [data, period]);

  return (
    <div className="divide-y">
      {movers.map((sector) => {
        const positive = sector.value >= 0;

        return (
          <div
            key={sector.name}
            className="flex items-center justify-between py-2 px-0"
          >
            {/* Sector Name */}
            <div className="flex flex-col pl-2">
              <span className="font-medium text-sm">{sector.name}</span>
              <span className="text-xs text-muted-foreground">
                {period} Flow
              </span>
            </div>

            {/* Value */}
            <div className="flex items-center gap-2 pr-2">
              {positive ? (
                <ArrowUpRight className="text-emerald-500" size={18} />
              ) : (
                <ArrowDownRight className="text-red-500" size={18} />
              )}

              <span
                className={`font-semibold ${
                  positive ? "text-emerald-500" : "text-red-500"
                }`}
              >
                ₹{Math.abs(sector.value).toLocaleString()}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
