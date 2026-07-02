import type { DashboardConfig } from "../types";

export const financeDashboardConfig: DashboardConfig = {
  id: "finance",
  title: "Finance dashboard",
  breadcrumbLabel: "Finance",
  path: "/dashboard/finance",
  getDescription: (data) =>
    data
      ? `Cash, expenses, and budget utilization for ${data.fromDate} through ${data.toDate}`
      : "Cash, expenses, and budget utilization",
  zones: [
    {
      id: "welcome",
      layout: "full",
      widgets: [{ id: "welcome", type: "welcome" }],
    },
    {
      id: "kpi",
      layout: "grid-4",
      widgets: [
        { id: "kpi-expenses", type: "kpi", props: { metric: "totalExpenses", label: "Total expenses", showTrend: true, invertTrend: true } },
        { id: "kpi-cash", type: "kpi", props: { metric: "cashBalance", label: "Cash balance" } },
        { id: "kpi-fund", type: "kpi", props: { metric: "totalFundBalance", label: "Fund balance" } },
        { id: "kpi-net", type: "kpi", props: { metric: "netPosition", label: "Net position" } },
      ],
    },
    {
      id: "tasks",
      layout: "full",
      widgets: [{ id: "finance-metrics", type: "finance-metrics" }],
    },
    {
      id: "analytics",
      layout: "full",
      widgets: [{ id: "chart-expenses", type: "chart-expense-trend" }],
    },
    {
      id: "actions",
      layout: "full",
      widgets: [{ id: "quick-actions", type: "quick-actions" }],
    },
  ],
};
