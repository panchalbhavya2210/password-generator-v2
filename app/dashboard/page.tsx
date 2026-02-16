import SectorTable from "./components/fii/sector-table";
import { sectorColumns } from "./components/fii/sector-columns";
import { getCDSLData } from "../lib/cdsl";
import SectorChart from "./components/fii/sector-chart";

export default async function Page() {
  const data = await getCDSLData();

  const grandTotal = data.sectors.find((s: any) => s.Sector === "Grand Total");

  // remove from table dataset
  const filtered = data.sectors.filter((s: any) => s.Sector !== "Grand Total");
  return (
    <>
      <SectorChart data={filtered} />
      <SectorTable columns={sectorColumns} data={filtered} />
    </>
  );
}
