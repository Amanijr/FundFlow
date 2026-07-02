"use client";

import { useExecutiveDashboard } from "@/hooks/use-analytics";
import { PageHeader } from "@/components/layout/page-header";

import { DashboardLayout } from "./layouts/dashboard-layout";
import type { DashboardConfig } from "./types";

interface DashboardPageProps {
  config: DashboardConfig;
}

export function DashboardPage({ config }: DashboardPageProps) {
  const periodQuery = useExecutiveDashboard();
  const description =
    periodQuery.isLoading && config.getDescription
      ? "Loading reporting period…"
      : config.getDescription?.(periodQuery.data);

  return (
    <div className="space-y-5">
      <PageHeader
        title={config.title}
        description={description}
        breadcrumbs={[
          { label: "Dashboard", href: config.path },
          { label: config.breadcrumbLabel },
        ]}
      />
      <DashboardLayout config={config} />
    </div>
  );
}
