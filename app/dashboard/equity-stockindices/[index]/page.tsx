"use client";

import { useEffect } from "react";

import { useParams } from "next/navigation";
import { useIndicesStore } from "@/app/store/indices-store";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { TrendingDown, TrendingUp } from "lucide-react";

export default function IndexPage() {
  const params = useParams();
  const index = decodeURIComponent(params.index as string);

  const { indices, loading, fetchIndex } = useIndicesStore();

  const data = indices[index];

  useEffect(() => {
    fetchIndex(index);
  }, [index]);

  if (loading[index]) return <div>Loading...</div>;
  if (!data) return <div>No Data</div>;
  console.log(data);
  const change = data.metadata.change;
  const isNegative = change < 0;

  return (
    <div>
      <h1 className="text-3xl font-semibold">{data.name} Overview</h1>
      <p className="mb-5">{data.name}'s Index Details</p>

      <Card>
        <div className="flex">
          <div className="mainfo flex items-start">
            <div>
              <h2 className="text-5xl font-semibold">{data.metadata.last}</h2>
            </div>
            <div
              className={`flex items-start justify-start px-2 py-1 rounded-full ${isNegative ? "bg-red-950" : "bg-green-950"}`}
            >
              {isNegative ? (
                <TrendingDown color="red" />
              ) : (
                <TrendingUp color="green" />
              )}
              <p
                className={`${isNegative ? "text-red-500" : "text-green-500"} ml-2`}
              >
                {data.metadata.change}
              </p>
            </div>
          </div>
          <Separator />
        </div>
      </Card>
    </div>
  );
}
