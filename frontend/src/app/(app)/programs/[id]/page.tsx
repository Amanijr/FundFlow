"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo } from "react";

import { DetailCard } from "@/components/display/detail-card";
import { ErrorAlert } from "@/components/feedback/error-alert";
import { LoadingState } from "@/components/feedback/loading-state";
import { PageHeader } from "@/components/layout/page-header";
import { SectionHeader } from "@/components/layout/section-header";
import { PermissionGate } from "@/components/security/permission-gate";
import { ProgramStatusBadge } from "@/components/verticals/vertical-status-badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { getProgram, getProgramDashboard } from "@/lib/api/programs";
import { MetricCard } from "@/components/charts/metric-card";
import { formatCurrency, toNumber } from "@/lib/utils/format";
import { formatDate, formatDateTime } from "@/lib/utils/dates";

export default function ProgramDetailPage() {
  const params = useParams();
  const { accessToken } = useAuth();
  const programId = Number(params.id);

  const programQuery = useQuery({
    queryKey: ["programs", programId],
    queryFn: async () => (await getProgram(accessToken!, programId)).data,
    enabled: Boolean(accessToken) && !Number.isNaN(programId),
  });

  const dashboardQuery = useQuery({
    queryKey: ["programs", programId, "dashboard"],
    queryFn: async () => (await getProgramDashboard(accessToken!, programId)).data,
    enabled: Boolean(accessToken) && !Number.isNaN(programId),
  });

  const kpis = useMemo(() => {
    const d = dashboardQuery.data;
    if (!d) return [];
    return [
      { label: "Grants", value: String(d.grantCount) },
      { label: "Active grants", value: String(d.activeGrantCount) },
      { label: "Total awarded", value: formatCurrency(toNumber(d.totalAwarded)) },
      { label: "Total spent", value: formatCurrency(toNumber(d.totalSpent)) },
      { label: "Remaining", value: formatCurrency(toNumber(d.remainingBalance)) },
    ];
  }, [dashboardQuery.data]);

  if (programQuery.isLoading) return <LoadingState />;
  if (programQuery.isError || !programQuery.data) return <ErrorAlert message="Unable to load program." />;

  const program = programQuery.data;
  const dashboard = dashboardQuery.data;

  return (
    <div className="space-y-4">
      <PageHeader
        breadcrumbs={[{ label: "Programs", href: "/programs" }, { label: program.name }]}
        title={program.name}
        description={`Code ${program.code}`}
        action={
          <PermissionGate roles={["ORG_ADMIN", "PROGRAM_MANAGER"]}>
            <Button variant="outline" asChild>
              <Link href={`/programs/${program.id}/edit`}>Edit</Link>
            </Button>
          </PermissionGate>
        }
      />

      <ProgramStatusBadge status={program.status} />

      <div className="grid gap-4 md:grid-cols-2">
        <DetailCard
          title="Program details"
          fields={[
            { label: "Description", value: program.description ?? "—" },
            { label: "Start date", value: program.startDate ? formatDate(program.startDate) : "—" },
            { label: "End date", value: program.endDate ? formatDate(program.endDate) : "—" },
            { label: "Created", value: formatDateTime(program.createdAt) },
          ]}
        />
        <DetailCard
          title="Linked fund"
          fields={[
            {
              label: "Fund",
              value: program.fundId ? (
                <Link href={`/funds/${program.fundId}`} className="text-primary hover:underline">
                  {program.fundName ?? `Fund #${program.fundId}`}
                </Link>
              ) : (
                "—"
              ),
            },
          ]}
        />
      </div>

      {dashboardQuery.isError && <ErrorAlert message="Unable to load program dashboard." />}

      {dashboard && (
        <section className="space-y-2">
          <SectionHeader title="Program dashboard" description="Grant and budget utilization summary" />
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
            {kpis.map((kpi) => (
              <MetricCard key={kpi.label} label={kpi.label} value={kpi.value} />
            ))}
          </div>
          {dashboard.activeBudgetId && (
            <DetailCard
              title="Active budget"
              fields={[
                {
                  label: "Budget",
                  value: (
                    <Link href={`/budgets/${dashboard.activeBudgetId}`} className="text-primary hover:underline">
                      {dashboard.activeBudgetName ?? `Budget #${dashboard.activeBudgetId}`}
                    </Link>
                  ),
                },
                {
                  label: "Amount",
                  value: dashboard.activeBudgetAmount != null ? formatCurrency(toNumber(dashboard.activeBudgetAmount)) : "—",
                },
              ]}
            />
          )}
        </section>
      )}
    </div>
  );
}
