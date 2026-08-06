import type { DashboardConfig } from "../types";

export const executiveDashboardConfig: DashboardConfig = {
  id: "executive",
  title: "Executive dashboard",
  breadcrumbLabel: "Executive",
  path: "/dashboard/executive",
  getDescription: (data) =>
    data
      ? `Organization overview for ${data.fromDate} through ${data.toDate}`
      : "Organization overview",
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
        {
          id: "kpi-donations",
          type: "kpi",
          props: { metric: "totalDonations", label: "Money in", showTrend: true },
        },
        {
          id: "kpi-expenses",
          type: "kpi",
          props: { metric: "totalExpenses", label: "Money out", showTrend: true, invertTrend: true },
        },
        { id: "kpi-cash", type: "kpi", props: { metric: "cashBalance", label: "Cash on hand" } },
      ],
    },
    {
      id: "alerts",
      layout: "full",
      widgets: [{ id: "insights", type: "insights" }],
    },
    {
      id: "actions",
      layout: "full",
      widgets: [{ id: "quick-actions", type: "quick-actions" }],
    },
  ],
};
