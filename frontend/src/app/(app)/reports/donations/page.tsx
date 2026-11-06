"use client";

import { useQuery } from "@tanstack/react-query";
import { type ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";

import { TrendChart } from "@/components/charts/trend-chart";
import { ExportActions } from "@/components/reports/export-actions";
import { ReportFilters } from "@/components/reports/report-filters";
import { ReportSummary } from "@/components/reports/report-summary";
import { ReportsNav } from "@/components/reports/reports-nav";
import { formatEnumLabel } from "@/components/finance/finance-status-badge";
import { PageHeader } from "@/components/layout/page-header";
import { SectionHeader } from "@/components/layout/section-header";
import { DataTable } from "@/components/tables/data-table";
import { ErrorAlert } from "@/components/feedback/error-alert";
import { LoadingState } from "@/components/feedback/loading-state";
import { useAuth } from "@/hooks/use-auth";
import { getExecutiveDashboard, getTrendAnalysis } from "@/lib/api/analytics";
import { formatCurrency, toNumber } from "@/lib/utils/format";
import { formatDate, toApiDate } from "@/lib/utils/dates";
import type { SourceBreakdown } from "@/types/analytics";

export default function DonationReportsPage() {
  const { accessToken } = useAuth();
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [appliedFrom, setAppliedFrom] = useState<string | undefined>();
  const [appliedTo, setAppliedTo] = useState<string | undefined>();

  const dashboardQuery = useQuery({
    queryKey: ["reports", "donations", "dashboard", appliedFrom, appliedTo],
    queryFn: async () => (await getExecutiveDashboard(accessToken!, appliedFrom, appliedTo)).data,
    enabled: Boolean(accessToken),
  });

  const trendsQuery = useQuery({
    queryKey: ["reports", "donations", "trends", appliedFrom, appliedTo],
    queryFn: async () => (await getTrendAnalysis(accessToken!, appliedFrom, appliedTo)).data,
    enabled: Boolean(accessToken),
  });

  const sourceColumns = useMemo<ColumnDef<SourceBreakdown>[]>(
    () => [
      {
        accessorKey: "source",
        header: "Source",
        cell: ({ row }) => formatEnumLabel(row.original.source),
      },
      {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ row }) => formatCurrency(toNumber(row.original.amount)),
      },
      { accessorKey: "count", header: "Gifts" },
    ],
    [],
  );

  const donationTrend =
    trendsQuery.data?.donationTrend.map((point) => ({
      label: point.period,
      value: toNumber(point.amount),
    })) ?? [];

  const exportRows = useMemo(() => {
    const sources = trendsQuery.data?.donationSources ?? [];
    return sources.map((s) => [s.source, toNumber(s.amount), s.count]);
  }, [trendsQuery.data?.donationSources]);

  if (dashboardQuery.isLoading || trendsQuery.isLoading) return <LoadingState />;

  const dashboard = dashboardQuery.data;

  return (
    <div className="space-y-4">
      <PageHeader title="Reports" description="Financial, fundraising, and budget reporting." />
      <ReportsNav />

      <PageHeader
        breadcrumbs={[{ label: "Donation reports" }]}
        title="Donation reports"
        action={
          <ExportActions
            filename="donation-sources.csv"
            headers={["Source", "Amount", "Count"]}
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

      {(dashboardQuery.isError || trendsQuery.isError) && (
        <ErrorAlert message="Unable to load donation reports." />
      )}

      {dashboard && (
        <ReportSummary
          metrics={[
            { label: "Total donations", value: formatCurrency(toNumber(dashboard.totalDonations)) },
            { label: "Donors", value: String(dashboard.donorCount) },
            { label: "Average gift", value: formatCurrency(toNumber(dashboard.averageDonation)) },
            {
              label: "Period",
              value: `${formatDate(dashboard.fromDate)} – ${formatDate(dashboard.toDate)}`,
            },
          ]}
        />
      )}

      <TrendChart title="Donation trend" data={donationTrend} />

      {trendsQuery.data && trendsQuery.data.donationSources.length > 0 && (
        <section className="space-y-4">
          <SectionHeader title="Donation sources" />
          <DataTable columns={sourceColumns} data={trendsQuery.data.donationSources} />
        </section>
      )}
    </div>
  );
}
