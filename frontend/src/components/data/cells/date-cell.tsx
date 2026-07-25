import { formatDate, formatDateTime } from "@/lib/utils/dates";
import { cn } from "@/lib/utils";

export interface DateCellProps {
  value?: string | null;
  format?: "date" | "datetime";
  className?: string;
}

export function DateCell({ value, format = "date", className }: DateCellProps) {
  const formatted = format === "datetime" ? formatDateTime(value) : formatDate(value);
  return <span className={cn("text-foreground", className)}>{formatted}</span>;
}
