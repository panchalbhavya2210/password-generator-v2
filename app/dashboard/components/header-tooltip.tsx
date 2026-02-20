"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function HeaderTooltip({
  label,
  description,
}: {
  label: React.ReactNode;
  description: string;
}) {
  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1 cursor-help">{label}</div>
        </TooltipTrigger>

        <TooltipContent
          side="top"
          className="max-w-[260px] text-xs leading-relaxed"
        >
          {description}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
