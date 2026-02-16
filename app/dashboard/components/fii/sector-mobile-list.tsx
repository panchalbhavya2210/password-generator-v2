"use client";

import { SectorFlow } from "@/app/types/sector";
import { calculateSectorMovers, Period } from "@/app/lib/sector-mover";
import { useMemo } from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

type Props = {
  data: SectorFlow[];
  period: Period;
};

export default function SectorMobileList({ data, period }: Props) {
  const movers = useMemo(() => {
    return calculateSectorMovers(data, period);
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
