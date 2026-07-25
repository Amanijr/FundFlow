"use client";

import { KPIWidget } from "@/components/charts/kpi-widget";
import { useExecutiveDashboard } from "@/hooks/use-analytics";
import { formatCurrency, toNumber } from "@/lib/utils/format";
import type { ExecutiveDashboardResponse } from "@/types/analytics";

import type { KPIMetricWidgetConfig, KPIMetricKey } from "../types";
import { resolveWidgetStatus } from "../utils/resolve-widget-status";
import { WidgetContainer } from "./widget-container";

const trendMetrics: Partial<Record<KPIMetricKey, keyof ExecutiveDashboardResponse>> = {
  totalDonations: "donationGrowthPercent",
  totalExpenses: "expenseGrowthPercent",
};

const currencyMetrics = new Set<KPIMetricKey>([
  "totalDonations",
  "totalExpenses",
  "netPosition",
  "cashBalance",
  "totalFundBalance",
  "averageDonation",
]);

function formatMetricValue(metric: KPIMetricKey, data: ExecutiveDashboardResponse) {
  const raw = data[metric];
  if (currencyMetrics.has(metric)) {
    return formatCurrency(toNumber(raw as number));
  }
  return String(raw);
}

export function KPIMetricWidget({ metric, label, showTrend, invertTrend }: KPIMetricWidgetConfig) {
  const query = useExecutiveDashboard();
  const status = resolveWidgetStatus({
    isLoading: query.isLoading,
    isError: query.isError,
    data: query.data,
  });

  return (
    <WidgetContainer
      id={`kpi-${metric}`}
      title={label}
      variant="kpi"
      status={status}
      onRefresh={() => query.refetch()}
      errorMessage={`Unable to load ${label.toLowerCase()}.`}
    >
      {query.data && (
        <KPIWidget
          label={label}
          value={formatMetricValue(metric, query.data)}
          changePercent={
            showTrend && trendMetrics[metric]
              ? toNumber(query.data[trendMetrics[metric]!] as number)
              : undefined
          }
          invertTrend={invertTrend}
        />
      )}
    </WidgetContainer>
  );
}
