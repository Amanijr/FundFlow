export { DashboardPage } from "./dashboard-page";
export { DashboardLayout } from "./layouts/dashboard-layout";
export { DashboardZone } from "./layouts/dashboard-zone";
export { WidgetContainer } from "./widgets/widget-container";
export { WidgetRenderer } from "./widgets/widget-renderer";
export { WelcomeBanner } from "./widgets/welcome-banner";
export { QuickActionCard } from "./widgets/quick-action-card";
export { KPIMetricWidget } from "./widgets/kpi-metric-widget";
export { ChartTrendWidget } from "./widgets/chart-trend-widget";
export { InsightsWidget } from "./widgets/insights-widget";
export { executiveDashboardConfig } from "./config/executive.dashboard";
export { financeDashboardConfig } from "./config/finance.dashboard";
export { fundraisingDashboardConfig } from "./config/fundraising.dashboard";
export type {
  DashboardConfig,
  DashboardZone as DashboardZoneId,
  DashboardZoneConfig,
  WidgetDefinition,
  WidgetStatus,
  WidgetType,
} from "./types";
