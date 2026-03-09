// @ts-nocheck
"use client";

import SectorChart from "./sector-chart";
import SectorTable from "./sector-table";
import { sectorColumns } from "./sector-columns";

export default function SectorClientWrapper({
  data,
  fullData,
}: {
  data: any[];
  fullData: any[];
}) {
  return (
    <>
      <SectorChart
        data={data}
        title="AUC Analysis"
        lastUpdated={fullData?.latestStatement!}
      />
      <SectorTable columns={sectorColumns} data={data} />
    </>
  );
}
