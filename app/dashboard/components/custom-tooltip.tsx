import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type CustomTooltipProps = {
  active?: boolean;
  payload?: any[];
};

export default function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;

  return (
    <div className="rounded-xl border bg-popover text-popover-foreground shadow-md pl-6 pr-2 py-2 text-sm">
      <div className="space-y-1 relative">
        <div
          className={`${
            data.direction === "buy" ? "bg-green-500" : "bg-red-500"
          } absolute w-2 rounded-full h-full -left-4 top-0 `}
        ></div>
        <p className="font-medium">{data.name}</p>

        <p
          className={`font-semibold ${
            data.direction === "buy" ? "text-emerald-500" : "text-red-500"
          }`}
        >
          ₹{data.value.toLocaleString("en-IN")}
        </p>
      </div>
    </div>
  );
}
