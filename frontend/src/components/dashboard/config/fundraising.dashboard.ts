import type { DashboardConfig } from "../types";

export const fundraisingDashboardConfig: DashboardConfig = {
  id: "fundraising",
  title: "Fundraising dashboard",
  breadcrumbLabel: "Fundraising",
  path: "/dashboard/fundraising",
  getDescription: (data) =>
    data
      ? `Donor and campaign performance for ${data.fromDate} through ${data.toDate}`
      : "Donor and campaign performance",
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
        { id: "kpi-donations", type: "kpi", props: { metric: "totalDonations", label: "Total donations", showTrend: true } },
        { id: "kpi-donors", type: "kpi", props: { metric: "donorCount", label: "Active donors" } },
        { id: "kpi-avg", type: "kpi", props: { metric: "averageDonation", label: "Average gift" } },
        { id: "kpi-campaigns", type: "kpi", props: { metric: "activeCampaignCount", label: "Active campaigns" } },
      ],
    },
    {
      id: "analytics",
      layout: "full",
      widgets: [{ id: "chart-donations", type: "chart-donation-trend" }],
    },
    {
      id: "tasks",
      layout: "full",
      widgets: [{ id: "donation-sources", type: "donation-sources" }],
    },
    {
      id: "activity",
      layout: "full",
      widgets: [{ id: "campaign-performance", type: "campaign-performance" }],
    },
    {
      id: "actions",
      layout: "full",
      widgets: [{ id: "quick-actions", type: "quick-actions" }],
    },
  ],
};
