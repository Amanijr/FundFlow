import { cn } from "@/lib/utils";

type MetricVariant = "neutral" | "success" | "warning" | "danger";

const variantClasses: Record<MetricVariant, string> = {
  neutral: "border-border bg-surface",
  success: "border-success/25 bg-success/5",
  warning: "border-warning/25 bg-warning/5",
  danger: "border-danger/25 bg-danger/5",
};

interface MetricCardProps {
  label: string;
  value: string;
  variant?: MetricVariant;
  className?: string;
}

export function MetricCard({ label, value, variant = "neutral", className }: MetricCardProps) {
  return (
    <div className={cn("rounded-md border px-3 py-2.5", variantClasses[variant], className)}>
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-lg font-semibold tabular-nums text-foreground">{value}</p>
    </div>
  );
}
