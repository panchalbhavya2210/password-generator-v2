"use client";

import { useIndustry } from "../../hooks/useIndustry";
import IndustryTable from "../components/industry/industry-table";
import { IndustryColums } from "../components/industry/industry-colums";
export default function SectorList() {
  const { data, isLoading, error } = useIndustry();
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading sectors</div>;

  return <IndustryTable columns={IndustryColums} data={data?.data} />;
}
