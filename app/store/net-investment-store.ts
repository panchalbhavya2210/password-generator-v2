"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  DBSectorFlowRow,
  SectorTableRow,
  SectorPeriod,
} from "../types/net-investment";
import {
  parseDBRows,
  computeSnapshots,
  toTableRows,
  sectorMapToRows,
} from "../lib/net-investment-pipeline";
import { shouldUseCache } from "./indices-store";

interface SectorFlowStore {
  raw: DBSectorFlowRow[] | null;
  sectorMap: Record<string, SectorPeriod[]> | null;
  tableRows: SectorTableRow[];

  loading: boolean;
  error: string | null;
  lastFetched: number | null;

  fetchFlow: () => Promise<void>;
  clear: () => void;
}

export const useNetInvestmentStore = create<SectorFlowStore>()(
  persist(
    (set, get) => ({
      raw: null,
      sectorMap: null,
      tableRows: [],
      loading: false,
      error: null,
      lastFetched: null,

      fetchFlow: async () => {
        const state = get();

        if (shouldUseCache(state.lastFetched ?? undefined)) return;
        if (state.loading) return;

        try {
          set({ loading: true, error: null });

          const res = await fetch("/api/net-investment", { cache: "no-store" });
          if (!res.ok) throw new Error("Fetch Failure");

          const rawMap = await res.json();
          console.log(rawMap, "raw");
          const rows = sectorMapToRows(rawMap);

          // -------- PIPELINE --------
          const parsed = parseDBRows(rows);
          const snapshots = computeSnapshots(parsed);
          const table = toTableRows(snapshots);

          set({
            raw: rows,
            sectorMap: parsed,
            tableRows: table,
            lastFetched: Date.now(),
            loading: false,
          });
        } catch {
          set({
            loading: false,
            error: "Failed to fetch net investment",
          });
        }
      },

      clear: () =>
        set({
          raw: null,
          sectorMap: null,
          tableRows: [],
          lastFetched: null,
          error: null,
        }),
    }),
    {
      name: "nse-net-investment",

      partialize: (state) => ({
        raw: state.raw,
        lastFetched: state.lastFetched,
      }),

      onRehydrateStorage: () => (state) => {
        if (!state?.raw) return;

        const parsed = parseDBRows(state.raw);
        const snapshots = computeSnapshots(parsed);
        const table = toTableRows(snapshots);

        state.sectorMap = parsed;
        state.tableRows = table;
      },
      // storage: createJSONStorage(() => localStorage),

      // // persist ONLY computed UI data
      // partialize: (state) => ({
      //   tableRows: state.tableRows,
      //   lastFetched: state.lastFetched,
      // }),
    },
  ),
);
