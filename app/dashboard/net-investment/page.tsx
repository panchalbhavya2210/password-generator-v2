// @ts-nocheck
"use client";

import { useEffect } from "react";
import { useNetInvestmentStore } from "@/app/store/net-investment-store";
import NetInvestMentTable from "../components/net-investment/net-investment-table";
import { NetInvestmentColumns } from "../components/net-investment/net-investment-columns";
import SectorChart from "../components/fii/sector-chart";

export default function NetInvestment() {
  const { tableRows, loading, error, fetchFlow } = useNetInvestmentStore();

  useEffect(() => {
    fetchFlow();
  }, [fetchFlow]);

  console.log(tableRows);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error Loading Data</div>;

  return (
    <>
      <SectorChart data={tableRows} title="Net Investment Details" />
      <NetInvestMentTable columns={NetInvestmentColumns} data={tableRows} />
    </>
  );
}
