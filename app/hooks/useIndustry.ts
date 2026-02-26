"use client";
import { useQuery } from "@tanstack/react-query";
import { AllIndices, useIndustryStore } from "@/app/store/industry-store";

const filterOut = [
  "NIFTY100LOWVOL30",
  "NIFTY200MOMENTM30",
  "NIFTYTOTALMKT",
  "NIFTYCONGLOMERATE",
  "NIFTYGS813YR",
];
const normalize = (str: string) =>
  str
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "") // remove spaces, hyphens, brackets, &
    .replace("VOLATILITY", "VOL") // NSE uses both words
    .replace("MOMENTUM", "MOMENT")
    .replace("INDEX", "")
    .replace("PRICE", "")
    .replace("RETURN", "");
async function fetchSectors() {
  const res = await fetch("/api/allIndices", { cache: "no-store" });
  const data = await res.json();

  const removePatterns =
    /(GS|SDL|LOWVOL|MOMENT|ALPHA|QUALITY|DIVOPP|LIQUID|CPSE|BHARATBOND|NIFTY SME EMERGE|NIFTY CONGOLEMERATE|NIFTY50 SHARIAH|NIFTY500 SHARIAH|NIFTY SHARIAH 25|NIFTY NONCYC CONS|NIFTY MS IND CONS|NIFTY100 ENH ESG|NIFTY100 LIQ 15|NIFTY MID LIQ 15|NIFTY TMMQ 50|NIFTY500 MQVLV50|NIFTY500 QLTY50|NIFTY50 EQL WGT|NIFTY100 EQL WGT|NIFTY50 TR 2X LEV|NIFTY50 PR 2X LEV|NIFTY50 TR 1X INV|NIFTY50 PR 1X INV)/;

  const filteredData = data.data.filter(
    (item) => !removePatterns.test(item.indexSymbol),
  );

  if (!res.ok) throw new Error("Failed to fetch sectors");

  return { ...data, data: filteredData };
}

export function useIndustry() {
  const setIndices = useIndustryStore((s) => s.setIndices);

  return useQuery({
    queryKey: ["nse-indices"],
    queryFn: fetchSectors,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    refetchInterval: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    onSuccess: (data: AllIndices) => {
      setIndices(data);
    },
  });
}
