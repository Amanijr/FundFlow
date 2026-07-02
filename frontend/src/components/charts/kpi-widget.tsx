import { TrendingDown, TrendingUp } from "lucide-react";

import { cn } from "@/lib/utils";

interface KPIWidgetProps {
  label: string;
  value: string;
  changePercent?: number;
  invertTrend?: boolean;
  className?: string;
}

export function KPIWidget({ label, value, changePercent, invertTrend, className }: KPIWidgetProps) {
  const positive = changePercent != null && changePercent >= 0;
  const favorable = invertTrend ? !positive : positive;

  return (
    <div className={cn("rounded-md border border-border bg-surface px-3 py-2.5", className)}>
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-lg font-semibold tabular-nums text-foreground">{value}</p>
      {changePercent != null && (
        <p className={cn("mt-1 flex items-center gap-1 text-[11px]", favorable ? "text-success" : "text-danger")}>
          {positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {Math.abs(changePercent)}% vs prior
        </p>
      )}
    </div>
  );
}
