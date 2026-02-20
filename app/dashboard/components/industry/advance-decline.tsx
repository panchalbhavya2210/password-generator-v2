"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { calculateBreadth } from "./market-breadth";

type Props = {
  advances: number | string;
  declines: number | string;
  unchanged?: number | string;
  indexName?: string;
};

export default function AdvanceDeclineBar({
  advances,
  declines,
  unchanged = 0,
  indexName,
}: Props) {
  const breadth = calculateBreadth({ advances, declines, unchanged });

  return (
    <div className="">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-semibold">
          {indexName ?? "Market Breadth"}
        </div>

        <div
          className={`text-xs px-2 py-1 rounded-md font-semibold
            ${
              breadth.sentiment === "bullish"
                ? "bg-emerald-500/15 text-emerald-500"
                : breadth.sentiment === "bearish"
                  ? "bg-red-500/15 text-red-500"
                  : "bg-muted text-muted-foreground"
            }`}
        >
          {breadth.sentiment.toUpperCase()}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative w-full h-6 rounded-xl overflow-hidden border">
        {/* Advances */}
        <div
          className="absolute left-0 top-0 h-full bg-emerald-500 transition-all duration-500"
          style={{ width: `${breadth.advPercent}%` }}
        />

        {/* Declines */}
        <div
          className="absolute right-0 top-0 h-full bg-red-500 transition-all duration-500"
          style={{ width: `${breadth.decPercent}%` }}
        />

        {/* Unchanged (thin center band) */}
        {breadth.uncPercent > 0 && (
          <div
            className="absolute top-0 h-full bg-gray-400/70"
            style={{
              left: `${breadth.advPercent}%`,
              width: `${breadth.uncPercent}%`,
            }}
          />
        )}

        {/* Center Ratio Label */}
        <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white drop-shadow">
          A/D {breadth.ratio.toFixed(2)}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mt-4 text-xs">
        <div className="flex items-center gap-2 justify-start text-emerald-500 font-semibold">
          <TrendingUp size={14} />
          {breadth.adv} Advances
        </div>

        <div className="flex items-center gap-2 justify-center text-muted-foreground font-semibold">
          <Minus size={14} />
          {breadth.unc} Unchanged
        </div>

        <div className="flex items-center gap-2 justify-end text-red-500 font-semibold">
          <TrendingDown size={14} />
          {breadth.dec} Declines
        </div>
      </div>
    </div>
  );
}
