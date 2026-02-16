export const PERIODS = ["15D", "30D", "90D", "180D", "360D"];
import { SectorFlow } from "@/app/types/sector";

export function buildSectorTrendChart(data: SectorFlow[]) {
  const clean = data.filter(
    (s) => s.Sector !== "Grand Total" && s.Sector !== "Sovereign",
  );

  const buyer = [...clean].sort((a, b) => b["360D"] - a["360D"])[0];
  const seller = [...clean].sort((a, b) => a["360D"] - b["360D"])[0];

  const chartData = PERIODS.map((p) => ({
    period: p,
    buyer: Math.max(0, buyer[p]),
    seller: Math.min(0, seller[p]),
  }));

  return {
    buyerName: buyer.Sector,
    sellerName: seller.Sector,
    chartData,
  };
}
