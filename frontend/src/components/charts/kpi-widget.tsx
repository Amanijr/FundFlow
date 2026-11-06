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
    <div
      className={cn(
        "rounded-[var(--radius-card)] border border-border bg-surface px-[var(--space-3)] py-[var(--space-3)]",
        className,
      )}
    >
      <p className="text-label uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-[var(--space-1)] text-kpi text-foreground">{value}</p>
      {changePercent != null && (
        <p
          className={cn(
            "mt-[var(--space-1)] flex items-center gap-1 text-label",
            favorable ? "text-success" : "text-danger",
          )}
        >
          {positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {Math.abs(changePercent)}% vs prior
        </p>
      )}
    </div>
  );
}
