// @ts-nocheck
"use client";

import { useEffect, useMemo, useState } from "react";
import { SectorFlow } from "@/app/types/sector";
import { calculateSectorMovers, Period } from "@/app/lib/sector-mover";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  CartesianGrid,
  LabelList,
} from "recharts";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip as RechartsTooltip } from "recharts";
import CustomTooltip from "../custom-tooltip";
import SectorChartSkeleton from "../skeleton/sector-chart-skeleton";
import { useMediaQuery } from "usehooks-ts";
import SectorMobileList from "./sector-mobile-list";

type Props = {
  data: SectorFlow[];
};

const renderValueLabel = (props: any) => {
  const { x, y, width, height, value } = props;

  // negative = sell/outflow
  const isNegative = Number(value) < 0;

  // move text outside the bar
  const labelX = isNegative ? x - 6 : x + width + 6;

  return (
    <text
      x={labelX}
      y={y + height / 2}
      textAnchor={isNegative ? "end" : "start"}
      dominantBaseline="middle"
      fontSize={12}
      fill="currentColor"
    >
      {Math.abs(value).toLocaleString()}
    </text>
  );
};

import { SectorTableRow } from "@/app/types/net-investment";

function adaptTableRows(rows: SectorTableRow[]): SectorFlow[] {
  return rows.map((r) => ({
    Sector: r.sector,
    "15D": r["15D"],
    "30D": r["30D"],
    "90D": r["90D"],
    "180D": r["180D"],
    "360D": r["365D"],
  }));
}
function isTableRow(data: any[]): data is SectorTableRow[] {
  return data.length > 0 && "sector" in data[0];
}

export default function SectorChart({ data }: Props) {
  const [period, setPeriod] = useState<Period>("15D");
  const isMobile = useMediaQuery("(max-width: 768px)");

  // const isLoading = !data || data.length === 0;
  // compute movers only when period changes

  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];

    const normalized: SectorFlow[] = isTableRow(data)
      ? adaptTableRows(data)
      : data;

    return calculateSectorMovers(normalized, period);
  }, [data, period]);

  // if (isLoading) return <SectorChartSkeleton />;
  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Sector Wise Data</CardTitle>

        <Select value={period} onValueChange={(v) => setPeriod(v as Period)}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Select Period" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="15D">15 Days</SelectItem>
            <SelectItem value="30D">30 Days</SelectItem>
            <SelectItem value="90D">90 Days</SelectItem>
            <SelectItem value="180D">6 Months</SelectItem>
            <SelectItem value="360D">1 Year</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>

      <CardContent className={isMobile ? "p-2" : "h-[460px]"}>
        {isMobile ? (
          <SectorMobileList data={data} period={period} />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 10, right: 60, left: 0, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="4 4" opacity="0.2" />

              <XAxis
                type="number"
                tickFormatter={(v) => {
                  const abs = Math.abs(v);
                  if (abs >= 100000) return `₹${(v / 100000).toFixed(1)}L`;
                  if (abs >= 1000) return `₹${(v / 1000).toFixed(0)}K`;
                  return `₹${v}`;
                }}
              />

              <YAxis
                type="category"
                dataKey="name"
                width={150}
                tick={{ fontSize: 12 }}
              />

              <RechartsTooltip
                cursor={{ fill: "rgba(255,255,255,0.05)" }}
                content={<CustomTooltip />}
              />

              <Bar dataKey="value" radius={[6, 6, 6, 6]}>
                <LabelList content={renderValueLabel} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
