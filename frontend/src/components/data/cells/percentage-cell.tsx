import { cn } from "@/lib/utils";
import { formatPercent } from "@/lib/utils/format";

export interface PercentageCellProps {
  value: number | string | null | undefined;
  decimals?: number;
  variant?: "default" | "positive" | "negative" | "auto";
  className?: string;
}

export function PercentageCell({
  value,
  decimals = 1,
  variant = "auto",
  className,
}: PercentageCellProps) {
  const numeric = typeof value === "number" ? value : value != null ? Number(value) : null;
  const resolvedVariant =
    variant === "auto"
      ? numeric != null && numeric < 0
        ? "negative"
        : "default"
      : variant;

  const colorClass =
    resolvedVariant === "negative"
      ? "text-destructive"
      : resolvedVariant === "positive"
        ? "text-success"
        : "text-foreground";

  return (
    <span className={cn("tabular-nums", colorClass, className)}>
      {formatPercent(numeric, decimals)}
    </span>
  );
}
