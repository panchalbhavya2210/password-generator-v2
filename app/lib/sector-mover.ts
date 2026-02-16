import { SectorFlow } from "../types/sector";
export type Period = "15D" | "30D" | "90D" | "180D" | "360D";

export type SectorMover = {
  name: string;
  value: number;
  direction: "buy" | "sell";
};

export function calculateSectorMovers(
  data: SectorFlow[],
  period: Period,
): SectorMover[] {
  // remove non-tradable sectors
  const clean = data.filter(
    (s) => s.Sector !== "Grand Total" && s.Sector !== "Sovereign",
  );

  // ---- TOP BUYING ----
  const gainers = [...clean]
    .sort((a, b) => b[period] - a[period])
    .slice(0, 5)
    .map((s) => ({
      name: s.Sector,
      value: s[period],
      direction: "buy" as const,
      fill: "#22c55e",
    }));

  // ---- TOP SELLING ----
  const losers = [...clean]
    .sort((a, b) => a[period] - b[period])
    .slice(0, 5)
    .map((s) => ({
      name: s.Sector,
      value: s[period],
      direction: "sell" as const,
      fill: "#ef4444",
    }));

  return [...gainers, ...losers];
}
