"use client";
import { useQuery } from "@tanstack/react-query";
import { Index } from "@/app/store/industry-store";
import { isMarketOpenNow } from "../lib/market-open";

const blacklist = new Set([
  "NIFTY50 SHARIAH",
  "NIFTY500 SHARIAH",
  "NIFTY SHARIAH 25",
  "BHARATBOND",
  "LOWVOL",
  "MOMENT",
  "QUALITY",
  "ALPHA",
  "DIVOPP",
  "NIFTY GS",
  "NIFTY SME",
]);

async function fetchSectors() {
  const res = await fetch("/api/allIndices");
  if (!res.ok) throw new Error("Failed to fetch sectors");
  const data = await res.json();

  const filteredData = data.data.filter(
    (item: Index) =>
      ![...blacklist].some((word) => item.indexSymbol.includes(word)),
  );

  return { ...data, data: filteredData };
}

export function useIndustry() {
  return useQuery({
    queryKey: ["nse-indices"],
    queryFn: fetchSectors,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    refetchInterval: isMarketOpenNow() ? 1000 * 60 * 10 : false,
    refetchOnWindowFocus: false,
  });
}
