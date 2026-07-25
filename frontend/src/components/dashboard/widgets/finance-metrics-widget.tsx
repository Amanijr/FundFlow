"use client";

import { MetricCard } from "@/components/charts/metric-card";
import { useExecutiveDashboard } from "@/hooks/use-analytics";
import { formatPercent, toNumber } from "@/lib/utils/format";

import { resolveWidgetStatus } from "../utils/resolve-widget-status";
import { WidgetContainer } from "./widget-container";

export function FinanceMetricsWidget() {
  const query = useExecutiveDashboard();
  const status = resolveWidgetStatus({
    isLoading: query.isLoading,
    isError: query.isError,
    data: query.data,
  });

  if (status !== "success") {
    return (
      <WidgetContainer
        id="finance-metrics"
        variant="panel"
        status={status}
        errorMessage="Unable to load finance metrics."
        onRefresh={() => query.refetch()}
      >
        {null}
      </WidgetContainer>
    );
  }

  const dashboard = query.data!;
  const budgetUtilization = dashboard.budgetUtilizationPercent;

  return (
    <div className="grid gap-3 md:grid-cols-3">
      <MetricCard
        label="Budget utilization"
        value={formatPercent(budgetUtilization != null ? toNumber(budgetUtilization) : null)}
        variant={
          budgetUtilization != null && toNumber(budgetUtilization) > 90
            ? "danger"
            : budgetUtilization != null && toNumber(budgetUtilization) > 75
              ? "warning"
              : "neutral"
        }
      />
      <MetricCard
        label="Pending expenses"
        value={String(dashboard.pendingExpenseCount)}
        variant={dashboard.pendingExpenseCount > 0 ? "warning" : "success"}
      />
      <MetricCard label="Reporting period" value={`${dashboard.fromDate} → ${dashboard.toDate}`} />
    </div>
  );
}
