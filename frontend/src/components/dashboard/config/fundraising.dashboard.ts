import type { DashboardConfig } from "../types";

export const fundraisingDashboardConfig: DashboardConfig = {
  id: "fundraising",
  title: "Fundraising dashboard",
  breadcrumbLabel: "Fundraising",
  path: "/dashboard/fundraising",
  getDescription: (data) =>
    data
      ? `Giving overview for ${data.fromDate} through ${data.toDate}`
      : "Giving overview",
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
          props: { metric: "totalDonations", label: "Donations", showTrend: true },
        },
        { id: "kpi-donors", type: "kpi", props: { metric: "donorCount", label: "Active donors" } },
        {
          id: "kpi-campaigns",
          type: "kpi",
          props: { metric: "activeCampaignCount", label: "Active campaigns" },
        },
      ],
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
