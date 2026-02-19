"use client";

import SectorChart from "./sector-chart";
import SectorTable from "./sector-table";
import { sectorColumns } from "./sector-columns";

export default function SectorClientWrapper({ data }: { data: any[] }) {
  return (
    <>
      <SectorChart data={data} />
      <SectorTable columns={sectorColumns} data={data} />
    </>
  );
}
