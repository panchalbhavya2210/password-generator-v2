import { create } from "zustand";
import { persist } from "zustand/middleware";

type Company = {
  symbol: string;
  ISIN: string;
  name: string;
};

type CompanyStore = {
  companies: Company[];
  loaded: boolean;
  loadCompanies: () => Promise<void>;
};

export const useCompanyStore = create<CompanyStore>()(
  persist(
    (set, get) => ({
      companies: [],
      loaded: false,

      loadCompanies: async () => {
        if (get().loaded) return;

        const res = await fetch("/api/companies");
        const json = await res.json();

        set({
          companies: json.companies,
          loaded: true,
        });
      },
    }),
    {
      name: "companies-cache",
    },
  ),
);
