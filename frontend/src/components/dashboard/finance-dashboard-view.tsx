"use client";

import { DashboardPage } from "@/components/dashboard/dashboard-page";
import { financeDashboardConfig } from "@/components/dashboard/config/finance.dashboard";

export function FinanceDashboardView() {
  return <DashboardPage config={financeDashboardConfig} />;
}
