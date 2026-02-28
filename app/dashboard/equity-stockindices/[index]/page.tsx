"use client";

import { useEffect } from "react";

import { useParams } from "next/navigation";
import { useIndicesStore } from "@/app/store/indices-store";
import { Card } from "@/components/ui/card";
import { TrendingDown, TrendingUp } from "lucide-react";
import AdvanceDeclineBar from "../../components/industry/advance-decline";
import EquityTable from "../../components/equity/equity-table";
import { EquityColums } from "../../components/equity/equity-column";

export default function IndexPage() {
  const params = useParams();
  const index = decodeURIComponent(params.index as string);

  const { indices, loading, fetchIndex } = useIndicesStore();

  const data = indices[index];

  const lastFetched = useIndicesStore((s) => s.lastFetched[index]);

  useEffect(() => {
    fetchIndex(index);
  }, [index, lastFetched, fetchIndex]);

  if (loading[index]) return <div>Loading...</div>;
  if (!data) return <div>No Data</div>;
  const change = data.metadata.change;
  const isNegative = change < 0;

  function calculatePercentage(change: number, last: number) {
    if (!last || isNaN(change)) return 0;
    const prevClose = last - change;
    if (prevClose === 0) return 0;
    const percent = (change / prevClose) * 100;
    return Number(percent.toFixed(2));
  }

  return (
    <div>
      <h1 className="text-3xl font-semibold">{data.name} Overview</h1>
      <p className="mb-5">{data.name}'s Index Details</p>

      <div className="flex gap-4">
        <Card className="p-4 w-full">
          <div className="flex ">
            <div className="mainfo flex items-start flex-1">
              <div>
                <h2
                  className={`text-5xl font-semibold ${isNegative ? "text-red-700" : "text-green-700"}`}
                >
                  {Number(data.metadata.last).toFixed(2)}
                </h2>
              </div>
              <div
                className={`flex shrink-0 items-center justify-start px-2 py-1 rounded-full ml-2 ${isNegative ? "bg-red-950" : "bg-green-950"}`}
              >
                {isNegative ? (
                  <TrendingDown color="red" size="18" />
                ) : (
                  <TrendingUp color="green" size="18" />
                )}
                <div
                  className={`${isNegative ? "text-red-500" : "text-green-500"} flex shrink-0 ml-2 text-sm`}
                >
                  {Number(data.metadata.change).toFixed(2)} /&nbsp;
                  {calculatePercentage(
                    data.metadata.change,
                    data.metadata.last,
                  )}
                  %
                </div>
              </div>
            </div>
          </div>
        </Card>
        <Card className="w-full p-4">
          <AdvanceDeclineBar
            advances={data.advance?.advances}
            declines={data.advance?.declines}
            unchanged={data.metadata.unchanged}
          />
        </Card>
      </div>
      <EquityTable columns={EquityColums} data={data.data} />
    </div>
  );
}
