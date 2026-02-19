"use client";

import { useQuery } from "@tanstack/react-query";

async function fetchSectors() {
  const res = await fetch("/api/allIndices", {
    cache: "no-store",
  });

  if (!res.ok) throw new Error("Failed to fetch sectors");

  return res.json();
}

export function useIndustry() {
  return useQuery({
    queryKey: ["nse-indices"], // single stable cache key
    queryFn: fetchSectors,

    staleTime: 1000 * 60 * 5, // data considered fresh for 5 min
    gcTime: 1000 * 60 * 30, // cache kept 30 min

    refetchInterval: 1000 * 60 * 5, // auto refresh every 5 min
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });
}
