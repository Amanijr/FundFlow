"use client";

import { useQuery } from "@tanstack/react-query";
import { type ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { useMemo, useState } from "react";

import { ExportActions } from "@/components/reports/export-actions";
import { ReportFilters } from "@/components/reports/report-filters";
import { ReportsNav } from "@/components/reports/reports-nav";
import { PageHeader } from "@/components/layout/page-header";
import { SectionHeader } from "@/components/layout/section-header";
import { DataTable } from "@/components/tables/data-table";
import { ErrorAlert } from "@/components/feedback/error-alert";
import { LoadingState } from "@/components/feedback/loading-state";
import { useAuth } from "@/hooks/use-auth";
import { getTrendAnalysis } from "@/lib/api/analytics";
import { formatCurrency, toNumber } from "@/lib/utils/format";
import { toApiDate } from "@/lib/utils/dates";
import type { CampaignPerformanceLine } from "@/types/analytics";

export default function CampaignReportsPage() {
  const { accessToken } = useAuth();
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [appliedFrom, setAppliedFrom] = useState<string | undefined>();
  const [appliedTo, setAppliedTo] = useState<string | undefined>();

  const trendsQuery = useQuery({
    queryKey: ["reports", "campaigns", appliedFrom, appliedTo],
    queryFn: async () => (await getTrendAnalysis(accessToken!, appliedFrom, appliedTo)).data,
    enabled: Boolean(accessToken),
  });

  const columns = useMemo<ColumnDef<CampaignPerformanceLine>[]>(
    () => [
      {
        accessorKey: "campaignName",
        header: "Campaign",
        cell: ({ row }) => (
          <Link
            href={`/campaigns/${row.original.campaignId}`}
            className="font-medium text-primary hover:underline"
          >
            {row.original.campaignName}
          </Link>
        ),
      },
      {
        accessorKey: "goalAmount",
        header: "Goal",
        cell: ({ row }) => formatCurrency(toNumber(row.original.goalAmount)),
      },
      {
        accessorKey: "raisedAmount",
        header: "Raised",
        cell: ({ row }) => formatCurrency(toNumber(row.original.raisedAmount)),
      },
      {
        accessorKey: "percentOfGoal",
        header: "% of goal",
        cell: ({ row }) => `${toNumber(row.original.percentOfGoal).toFixed(1)}%`,
      },
    ],
    [],
  );

  const exportRows = useMemo(
    () =>
      (trendsQuery.data?.campaignPerformance ?? []).map((line) => [
        line.campaignName,
        toNumber(line.goalAmount),
        toNumber(line.raisedAmount),
        toNumber(line.percentOfGoal),
      ]),
    [trendsQuery.data?.campaignPerformance],
  );

  if (trendsQuery.isLoading) return <LoadingState />;

  return (
    <div className="space-y-4">
      <PageHeader title="Reports" description="Financial, fundraising, and budget reporting." />
      <ReportsNav />

      <PageHeader
        breadcrumbs={[{ label: "Campaign reports" }]}
        title="Campaign reports"
        action={
          <ExportActions
            filename="campaign-performance.csv"
            headers={["Campaign", "Goal", "Raised", "Percent of goal"]}
            rows={exportRows}
          />
        }
      />

      <ReportFilters
        fromDate={fromDate}
        toDate={toDate}
        onFromChange={setFromDate}
        onToChange={setToDate}
        onApply={() => {
          setAppliedFrom(toApiDate(fromDate));
          setAppliedTo(toApiDate(toDate));
        }}
        onReset={() => {
          setFromDate(null);
          setToDate(null);
          setAppliedFrom(undefined);
          setAppliedTo(undefined);
        }}
      />

      {trendsQuery.isError && <ErrorAlert message="Unable to load campaign reports." />}

      <section className="space-y-4">
        <SectionHeader title="Campaign performance" description="Progress toward fundraising goals" />
        <DataTable columns={columns} data={trendsQuery.data?.campaignPerformance ?? []} />
      </section>
    </div>
  );
}
