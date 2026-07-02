"use client";

import { useQuery } from "@tanstack/react-query";
import { type ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";

import { ExportActions } from "@/components/reports/export-actions";
import { ReportFilters } from "@/components/reports/report-filters";
import { ReportSummary } from "@/components/reports/report-summary";
import { ReportsNav } from "@/components/reports/reports-nav";
import { PageHeader } from "@/components/layout/page-header";
import { SectionHeader } from "@/components/layout/section-header";
import { DataTable } from "@/components/tables/data-table";
import { ErrorAlert } from "@/components/feedback/error-alert";
import { LoadingState } from "@/components/feedback/loading-state";
import { useAuth } from "@/hooks/use-auth";
import { getBudgetReport } from "@/lib/api/reports";
import { formatCurrency, toNumber } from "@/lib/utils/format";
import { formatDate, toApiDate } from "@/lib/utils/dates";
import type { BudgetReportLine } from "@/types/reports";

export default function BudgetReportsPage() {
  const { accessToken } = useAuth();
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [appliedFrom, setAppliedFrom] = useState<string | undefined>();
  const [appliedTo, setAppliedTo] = useState<string | undefined>();

  const reportQuery = useQuery({
    queryKey: ["reports", "budget", appliedFrom, appliedTo],
    queryFn: async () => (await getBudgetReport(accessToken!, appliedFrom, appliedTo)).data,
    enabled: Boolean(accessToken),
  });

  const columns = useMemo<ColumnDef<BudgetReportLine>[]>(
    () => [
      { accessorKey: "accountCode", header: "Code" },
      { accessorKey: "accountName", header: "Account" },
      {
        accessorKey: "budgetAmount",
        header: "Budget",
        cell: ({ row }) => formatCurrency(toNumber(row.original.budgetAmount)),
      },
      {
        accessorKey: "actualAmount",
        header: "Actual",
        cell: ({ row }) => formatCurrency(toNumber(row.original.actualAmount)),
      },
      {
        accessorKey: "variance",
        header: "Variance",
        cell: ({ row }) => formatCurrency(toNumber(row.original.variance)),
      },
    ],
    [],
  );

  const exportRows = useMemo(
    () =>
      (reportQuery.data?.lines ?? []).map((line) => [
        line.accountCode,
        line.accountName,
        toNumber(line.budgetAmount),
        toNumber(line.actualAmount),
        toNumber(line.variance),
      ]),
    [reportQuery.data?.lines],
  );

  if (reportQuery.isLoading) return <LoadingState />;
  if (reportQuery.isError || !reportQuery.data) return <ErrorAlert message="Unable to load budget report." />;

  const report = reportQuery.data;

  return (
    <div className="space-y-4">
      <PageHeader title="Reports" description="Financial, fundraising, and budget reporting." />
      <ReportsNav />

      <PageHeader
        breadcrumbs={[{ label: "Budget reports" }]}
        title="Budget reports"
        action={
          <ExportActions
            filename="budget-report.csv"
            headers={["Code", "Account", "Budget", "Actual", "Variance"]}
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

      <ReportSummary
        metrics={[
          { label: "Total budget", value: formatCurrency(toNumber(report.totalBudget)) },
          { label: "Total actual", value: formatCurrency(toNumber(report.totalActual)) },
          {
            label: "Variance",
            value: formatCurrency(toNumber(report.totalVariance)),
            variant: toNumber(report.totalVariance) <= 0 ? "success" : "warning",
          },
          {
            label: "Period",
            value:
              report.fromDate && report.toDate
                ? `${formatDate(report.fromDate)} – ${formatDate(report.toDate)}`
                : "Current period",
          },
        ]}
      />

      {report.note && <p className="text-sm text-muted-foreground">{report.note}</p>}

      <section className="space-y-4">
        <SectionHeader title="Budget vs actual" />
        <DataTable columns={columns} data={report.lines} />
      </section>
    </div>
  );
}
