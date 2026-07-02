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
      label: "Key metrics",
      layout: "grid-4",
      widgets: [
        { id: "kpi-donations", type: "kpi", props: { metric: "totalDonations", label: "Total donations", showTrend: true } },
        { id: "kpi-expenses", type: "kpi", props: { metric: "totalExpenses", label: "Total expenses", showTrend: true, invertTrend: true } },
        { id: "kpi-net", type: "kpi", props: { metric: "netPosition", label: "Net position" } },
        { id: "kpi-cash", type: "kpi", props: { metric: "cashBalance", label: "Cash balance" } },
        { id: "kpi-fund", type: "kpi", props: { metric: "totalFundBalance", label: "Fund balance" } },
        { id: "kpi-donors", type: "kpi", props: { metric: "donorCount", label: "Active donors" } },
        { id: "kpi-avg", type: "kpi", props: { metric: "averageDonation", label: "Avg donation" } },
        { id: "kpi-campaigns", type: "kpi", props: { metric: "activeCampaignCount", label: "Active campaigns" } },
      ],
    },
    {
      id: "alerts",
      layout: "full",
      widgets: [{ id: "insights", type: "insights" }],
    },
    {
      id: "analytics",
      label: "Analytics",
      layout: "grid-2",
      widgets: [
        { id: "chart-donations", type: "chart-donation-trend" },
        { id: "chart-expenses", type: "chart-expense-trend" },
      ],
    },
    {
      id: "actions",
      layout: "full",
      widgets: [{ id: "quick-actions", type: "quick-actions" }],
    },
  ],
};
