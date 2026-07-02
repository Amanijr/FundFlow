import { cn } from "@/lib/utils";
import { formatCurrency, toNumber } from "@/lib/utils/format";

export interface CurrencyCellProps {
  value: number | string | null | undefined;
  currency?: string;
  locale?: string;
  variant?: "default" | "positive" | "negative" | "muted";
  className?: string;
}

const variantClasses = {
  default: "text-foreground",
  positive: "text-success",
  negative: "text-destructive",
  muted: "text-muted-foreground",
} as const;

export function CurrencyCell({
  value,
  currency = "TZS",
  locale = "en-US",
  variant = "default",
  className,
}: CurrencyCellProps) {
  return (
    <span className={cn("block text-right tabular-nums", variantClasses[variant], className)}>
      {formatCurrency(toNumber(value), currency, locale)}
    </span>
  );
}
