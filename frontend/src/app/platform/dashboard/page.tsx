"use client";

import { useQuery } from "@tanstack/react-query";
import { type ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { useMemo } from "react";

import { MetricCard } from "@/components/charts/metric-card";
import { ErrorAlert } from "@/components/feedback/error-alert";
import { LoadingState } from "@/components/feedback/loading-state";
import { formatEnumLabel } from "@/components/finance/finance-status-badge";
import { PageHeader } from "@/components/layout/page-header";
import { SectionHeader } from "@/components/layout/section-header";
import { LogSeverityBadge, LogTypeBadge } from "@/components/platform/log-status-badge";
import { DataTable } from "@/components/tables/data-table";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { getPlatformDashboard } from "@/lib/api/platform";
import { formatDateTime } from "@/lib/utils/dates";
import type { PlatformOrganization, PlatformUser, SystemLogResponse } from "@/types/platform";

export default function PlatformDashboardPage() {
  const { accessToken } = useAuth();

  const dashboardQuery = useQuery({
    queryKey: ["platform", "dashboard"],
    queryFn: async () => (await getPlatformDashboard(accessToken!)).data,
    enabled: Boolean(accessToken),
  });

  const orgColumns = useMemo<ColumnDef<PlatformOrganization>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Organization",
        cell: ({ row }) => (
          <Link
            href={`/platform/dashboard/organizations/${row.original.id}`}
            className="font-medium text-primary hover:underline"
          >
            {row.original.name}
          </Link>
        ),
      },
      { accessorKey: "slug", header: "Slug" },
      {
        accessorKey: "type",
        header: "Type",
        cell: ({ row }) => formatEnumLabel(row.original.type),
      },
      {
        accessorKey: "active",
        header: "Status",
        cell: ({ row }) => (
          <Badge variant={row.original.active ? "success" : "secondary"}>
            {row.original.active ? "Active" : "Inactive"}
          </Badge>
        ),
      },
    ],
    [],
  );

  const userColumns = useMemo<ColumnDef<PlatformUser>[]>(
    () => [
      {
        accessorKey: "name",
        header: "User",
        cell: ({ row }) => `${row.original.firstName} ${row.original.lastName}`,
      },
      { accessorKey: "email", header: "Email" },
      {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => formatEnumLabel(row.original.role),
      },
      {
        accessorKey: "organizationName",
        header: "Organization",
        cell: ({ row }) => row.original.organizationName ?? "Platform",
      },
    ],
    [],
  );

  const logColumns = useMemo<ColumnDef<SystemLogResponse>[]>(
    () => [
      {
        accessorKey: "createdAt",
        header: "Time",
        cell: ({ row }) => formatDateTime(row.original.createdAt),
      },
      {
        accessorKey: "logType",
        header: "Type",
        cell: ({ row }) => <LogTypeBadge type={row.original.logType} />,
      },
      {
        accessorKey: "severity",
        header: "Severity",
        cell: ({ row }) => <LogSeverityBadge severity={row.original.severity} />,
      },
      {
        accessorKey: "message",
        header: "Message",
        cell: ({ row }) => (
          <Link href={`/platform/dashboard/logs/${row.original.id}`} className="hover:underline">
            {row.original.message}
          </Link>
        ),
      },
    ],
    [],
  );

  if (dashboardQuery.isLoading) return <LoadingState />;

  if (dashboardQuery.isError || !dashboardQuery.data) {
    return <ErrorAlert message="Unable to load platform dashboard." />;
  }

  const dashboard = dashboardQuery.data;
  const stats = dashboard.platformStats;

  return (
    <div className="space-y-4">
      <PageHeader
        title="Platform overview"
        description="Cross-tenant snapshot for platform operators."
      />

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
        <MetricCard label="Organizations" value={String(stats.totalOrganizations)} />
        <MetricCard label="Active orgs" value={String(stats.activeOrganizations)} variant="success" />
        <MetricCard label="Total users" value={String(stats.totalUsers)} />
        <MetricCard label="Super admins" value={String(stats.superAdminCount)} />
        <MetricCard label="Logs (24h)" value={String(dashboard.logsLast24Hours)} />
        <MetricCard label="Errors (24h)" value={String(dashboard.errorsLast24Hours)} variant="danger" />
        <MetricCard
          label="Security (24h)"
          value={String(dashboard.securityEventsLast24Hours)}
          variant="warning"
        />
        <MetricCard
          label="Open alerts"
          value={String(dashboard.unresolvedAlerts)}
          variant={dashboard.unresolvedAlerts > 0 ? "warning" : "neutral"}
        />
      </div>

      <section className="space-y-2">
        <SectionHeader
          title="Organizations"
          description={`${dashboard.inactiveOrganizations} inactive tenant(s)`}
          action={
            <Link href="/platform/dashboard/organizations" className="text-sm text-primary hover:underline">
              View all
            </Link>
          }
        />
        <DataTable columns={orgColumns} data={dashboard.organizations.slice(0, 8)} />
      </section>

      <section className="space-y-2">
        <SectionHeader
          title="Users"
          description="Cross-tenant directory"
          action={
            <Link href="/platform/dashboard/users" className="text-sm text-primary hover:underline">
              View all
            </Link>
          }
        />
        <DataTable columns={userColumns} data={dashboard.users.slice(0, 8)} />
      </section>

      <section className="space-y-2">
        <SectionHeader
          title="Recent alerts"
          description="Unresolved platform alerts"
          action={
            <Link href="/platform/dashboard/logs?alertsOnly=true" className="text-sm text-primary hover:underline">
              View logs
            </Link>
          }
        />
        <DataTable columns={logColumns} data={dashboard.recentAlerts} />
      </section>

      <section className="space-y-2">
        <SectionHeader title="Recent errors" description="Latest error and exception entries" />
        <DataTable columns={logColumns} data={dashboard.recentErrors} />
      </section>
    </div>
  );
}
