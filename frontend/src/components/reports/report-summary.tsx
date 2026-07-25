import { MetricCard } from "@/components/charts/metric-card";

interface SummaryMetric {
  label: string;
  value: string;
  variant?: "neutral" | "success" | "warning" | "danger";
}

interface ReportSummaryProps {
  metrics: SummaryMetric[];
}

export function ReportSummary({ metrics }: ReportSummaryProps) {
  if (metrics.length === 0) {
    return null;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => (
        <MetricCard key={metric.label} {...metric} />
      ))}
    </div>
  );
}
