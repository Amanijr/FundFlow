"use client";

import { DashboardPage } from "@/components/dashboard/dashboard-page";
import { fundraisingDashboardConfig } from "@/components/dashboard/config/fundraising.dashboard";

export function FundraisingDashboardView() {
  return <DashboardPage config={fundraisingDashboardConfig} />;
}
