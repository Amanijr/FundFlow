import { cn } from "@/lib/utils";
import { SectionHeader } from "@/components/layout/section-header";
import type { InsightItem, InsightSeverity } from "@/types/analytics";

interface DashboardInsightsProps {
  insights: InsightItem[];
}

const severityStyles: Record<InsightSeverity, string> = {
  INFO: "border-l-success bg-success/5",
  WARNING: "border-l-warning bg-warning/5",
  CRITICAL: "border-l-danger bg-danger/5",
};

const severityText: Record<InsightSeverity, string> = {
  INFO: "text-foreground",
  WARNING: "text-foreground",
  CRITICAL: "text-foreground",
};

export function DashboardInsights({ insights }: DashboardInsightsProps) {
  if (insights.length === 0) {
    return null;
  }

  return (
    <section className="space-y-2">
      <SectionHeader title="Insights" description="Operational alerts" />
      <div className="overflow-hidden rounded-md border border-border bg-surface">
        {insights.map((insight, index) => (
          <div
            key={`${insight.title}-${index}`}
            className={cn(
              "border-l-2 px-3 py-2 text-[13px]",
              severityStyles[insight.severity],
              severityText[insight.severity],
              index > 0 && "border-t border-border",
            )}
          >
            <p className="font-medium">{insight.title}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{insight.message}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
