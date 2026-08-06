import type { DashboardConfig } from "../types";

export const financeDashboardConfig: DashboardConfig = {
  id: "finance",
  title: "Finance dashboard",
  breadcrumbLabel: "Finance",
  path: "/dashboard/finance",
  getDescription: (data) =>
    data
      ? `Cash and spending for ${data.fromDate} through ${data.toDate}`
      : "Cash and spending",
  zones: [
    {
      id: "welcome",
      layout: "full",
      widgets: [{ id: "welcome", type: "welcome" }],
    },
    {
      id: "kpi",
      label: "At a glance",
      layout: "grid-3",
      widgets: [
        { id: "kpi-cash", type: "kpi", props: { metric: "cashBalance", label: "Cash on hand" } },
        {
          id: "kpi-expenses",
          type: "kpi",
          props: { metric: "totalExpenses", label: "Expenses", showTrend: true, invertTrend: true },
        },
        { id: "kpi-fund", type: "kpi", props: { metric: "totalFundBalance", label: "Fund balance" } },
      ],
    },
    {
      id: "tasks",
      layout: "full",
      widgets: [{ id: "finance-metrics", type: "finance-metrics" }],
    },
    {
      id: "actions",
      layout: "full",
      widgets: [{ id: "quick-actions", type: "quick-actions" }],
    },
  ],
};
