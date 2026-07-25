"use client";

import { useAuth } from "@/hooks/use-auth";

import type { KPIMetricWidgetConfig, WidgetDefinition } from "../types";
import { CampaignPerformanceWidget } from "./campaign-performance-widget";
import { ChartTrendWidget } from "./chart-trend-widget";
import { DonationSourcesWidget } from "./donation-sources-widget";
import { FinanceMetricsWidget } from "./finance-metrics-widget";
import { InsightsWidget } from "./insights-widget";
import { KPIMetricWidget } from "./kpi-metric-widget";
import { QuickActionCard } from "./quick-action-card";
import { WelcomeBanner } from "./welcome-banner";

function isRoleAllowed(roles: WidgetDefinition["roles"], userRole?: string) {
  if (!roles?.length) return true;
  if (!userRole) return false;
  return roles.includes(userRole as never);
}

export function WidgetRenderer({ definition }: { definition: WidgetDefinition }) {
  const { user } = useAuth();

  if (!isRoleAllowed(definition.roles, user?.role)) {
    return null;
  }

  switch (definition.type) {
    case "welcome":
      return <WelcomeBanner />;
    case "kpi":
      return <KPIMetricWidget {...(definition.props as unknown as KPIMetricWidgetConfig)} />;
    case "chart-donation-trend":
      return <ChartTrendWidget id={definition.id} title="Donation trend" series="donation" />;
    case "chart-expense-trend":
      return <ChartTrendWidget id={definition.id} title="Expense trend" series="expense" />;
    case "insights":
      return <InsightsWidget />;
    case "finance-metrics":
      return <FinanceMetricsWidget />;
    case "donation-sources":
      return <DonationSourcesWidget />;
    case "campaign-performance":
      return <CampaignPerformanceWidget />;
    case "quick-actions":
      return <QuickActionCard />;
    default:
      return null;
  }
}
