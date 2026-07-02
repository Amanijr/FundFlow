import type { Role } from "@/types/api";
import type { ExecutiveDashboardResponse } from "@/types/analytics";

export type DashboardZone =
  | "welcome"
  | "kpi"
  | "alerts"
  | "activity"
  | "analytics"
  | "tasks"
  | "actions";

export type WidgetType =
  | "welcome"
  | "kpi"
  | "chart-donation-trend"
  | "chart-expense-trend"
  | "insights"
  | "finance-metrics"
  | "donation-sources"
  | "campaign-performance"
  | "quick-actions";

export type WidgetStatus = "loading" | "success" | "empty" | "error";

export type KPIMetricKey = keyof Pick<
  ExecutiveDashboardResponse,
  | "totalDonations"
  | "totalExpenses"
  | "netPosition"
  | "cashBalance"
  | "totalFundBalance"
  | "donorCount"
  | "averageDonation"
  | "activeCampaignCount"
>;

export interface KPIMetricWidgetConfig {
  metric: KPIMetricKey;
  label: string;
  showTrend?: boolean;
  invertTrend?: boolean;
}

export interface WidgetDefinition {
  id: string;
  type: WidgetType;
  props?: Record<string, unknown>;
  roles?: Role[];
}

export interface DashboardZoneConfig {
  id: DashboardZone;
  label?: string;
  description?: string;
  layout?: "full" | "grid-2" | "grid-3" | "grid-4";
  widgets: WidgetDefinition[];
}

export interface DashboardConfig {
  id: string;
  title: string;
  breadcrumbLabel: string;
  path: string;
  getDescription?: (data: ExecutiveDashboardResponse | undefined) => string;
  zones: DashboardZoneConfig[];
}
