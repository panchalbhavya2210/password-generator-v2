import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function SectorChartSkeleton() {
  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        {/* Title */}
        <Skeleton className="h-6 w-40" />

        {/* Select dropdown */}
        <Skeleton className="h-9 w-[130px]" />
      </CardHeader>

      <CardContent className="h-[460px]">
        <div className="flex h-full w-full gap-4">
          {/* Y-axis labels */}
          <div className="flex flex-col justify-between py-2 w-[150px]">
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className="h-3 w-[120px]" />
            ))}
          </div>

          {/* Bars */}
          <div className="flex flex-col justify-between w-full py-2">
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton
                key={i}
                className="h-6 w-[80%] rounded-md"
                style={{
                  width: `${60 + Math.random() * 40}%`,
                }}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
