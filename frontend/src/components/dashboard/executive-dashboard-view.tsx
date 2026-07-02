"use client";

import { DashboardPage } from "@/components/dashboard/dashboard-page";
import { executiveDashboardConfig } from "@/components/dashboard/config/executive.dashboard";

export function ExecutiveDashboardView() {
  return <DashboardPage config={executiveDashboardConfig} />;
}
