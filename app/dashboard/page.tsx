import { getCDSLData } from "../lib/cdsl";
import SectorClientWrapper from "./components/fii/sector-client-wrapper";

export default async function Page() {
  const data = await getCDSLData();

  const filtered = data.sectors.filter((s: any) => s.Sector !== "Grand Total");

  return <SectorClientWrapper data={filtered} />;
}
