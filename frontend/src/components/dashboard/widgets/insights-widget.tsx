"use client";

import { DashboardInsights } from "@/components/dashboard/dashboard-insights";
import { useInsights } from "@/hooks/use-analytics";

import { resolveWidgetStatus } from "../utils/resolve-widget-status";
import { WidgetContainer } from "./widget-container";

export function InsightsWidget() {
  const query = useInsights();
  const status = resolveWidgetStatus({
    isLoading: query.isLoading,
    isError: query.isError,
    data: query.data,
    isEmpty: (data) => data.insights.length === 0,
  });

  if (status === "empty") {
    return null;
  }

  if (status !== "success") {
    return (
      <WidgetContainer
        id="insights"
        title="Operational alerts"
        status={status}
        errorMessage="Unable to load operational alerts."
        onRefresh={() => query.refetch()}
      >
        {null}
      </WidgetContainer>
    );
  }

  return <DashboardInsights insights={query.data!.insights} />;
}
