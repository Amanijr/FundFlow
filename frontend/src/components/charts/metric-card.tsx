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
    <div
      className={cn(
        "rounded-[var(--radius-card)] border px-[var(--space-3)] py-[var(--space-3)]",
        variantClasses[variant],
        className,
      )}
    >
      <p className="text-label uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-[var(--space-1)] text-kpi text-foreground">{value}</p>
    </div>
  );
}
