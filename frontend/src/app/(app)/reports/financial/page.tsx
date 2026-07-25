"use client";

import { useQuery } from "@tanstack/react-query";
import { type ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";

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
import { listFunds } from "@/lib/api/funds";
import {
  getBalanceSheetReport,
  getCashFlowReport,
  getFundReport,
  getIncomeExpenditureReport,
} from "@/lib/api/reports";
import { formatCurrency, toNumber } from "@/lib/utils/format";
import { formatDate, toApiDate } from "@/lib/utils/dates";
import type { FinancialReportType } from "@/types/reports";
import type { FundReportLine, ReportLineItem } from "@/types/reports";

const reportTypes: { id: FinancialReportType; label: string }[] = [
  { id: "income-expenditure", label: "Income & expenditure" },
  { id: "balance-sheet", label: "Balance sheet" },
  { id: "cash-flow", label: "Cash flow" },
  { id: "funds", label: "Fund activity" },
];

export default function FinancialReportsPage() {
  const { accessToken } = useAuth();
  const [reportType, setReportType] = useState<FinancialReportType>("income-expenditure");
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [asOfDate, setAsOfDate] = useState<Date | null>(null);
  const [fundId, setFundId] = useState("");
  const [applied, setApplied] = useState({
    type: "income-expenditure" as FinancialReportType,
    from: undefined as string | undefined,
    to: undefined as string | undefined,
    asOf: undefined as string | undefined,
    fundId: undefined as number | undefined,
  });

  const fundsQuery = useQuery({
    queryKey: ["funds"],
    queryFn: async () => (await listFunds(accessToken!)).data,
    enabled: Boolean(accessToken),
  });

  const reportQuery = useQuery({
    queryKey: ["reports", applied],
    queryFn: async () => {
      if (applied.type === "income-expenditure") {
        return (await getIncomeExpenditureReport(accessToken!, applied.from, applied.to)).data;
      }
      if (applied.type === "balance-sheet") {
        return (await getBalanceSheetReport(accessToken!, applied.asOf)).data;
      }
      if (applied.type === "cash-flow") {
        return (await getCashFlowReport(accessToken!, applied.from, applied.to)).data;
      }
      return (await getFundReport(accessToken!, applied.from, applied.to, applied.fundId)).data;
    },
    enabled: Boolean(accessToken),
  });

  const lineColumns = useMemo<ColumnDef<ReportLineItem>[]>(
    () => [
      { accessorKey: "code", header: "Code" },
      { accessorKey: "name", header: "Account" },
      {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ row }) => formatCurrency(toNumber(row.original.amount)),
      },
    ],
    [],
  );

  const fundColumns = useMemo<ColumnDef<FundReportLine>[]>(
    () => [
      { accessorKey: "fundCode", header: "Code" },
      { accessorKey: "fundName", header: "Fund" },
      {
        accessorKey: "fundType",
        header: "Type",
        cell: ({ row }) => formatEnumLabel(row.original.fundType),
      },
      {
        accessorKey: "revenue",
        header: "Revenue",
        cell: ({ row }) => formatCurrency(toNumber(row.original.revenue)),
      },
      {
        accessorKey: "expenses",
        header: "Expenses",
        cell: ({ row }) => formatCurrency(toNumber(row.original.expenses)),
      },
      {
        accessorKey: "netActivity",
        header: "Net",
        cell: ({ row }) => formatCurrency(toNumber(row.original.netActivity)),
      },
      {
        accessorKey: "operationalBalance",
        header: "Balance",
        cell: ({ row }) => formatCurrency(toNumber(row.original.operationalBalance)),
      },
    ],
    [],
  );

  function applyFilters() {
    setApplied({
      type: reportType,
      from: toApiDate(fromDate),
      to: toApiDate(toDate),
      asOf: toApiDate(asOfDate),
      fundId: fundId ? Number(fundId) : undefined,
    });
  }

  function resetFilters() {
    setFromDate(null);
    setToDate(null);
    setAsOfDate(null);
    setFundId("");
    setApplied({ type: reportType, from: undefined, to: undefined, asOf: undefined, fundId: undefined });
  }

  const exportRows = useMemo(() => {
    const data = reportQuery.data;
    if (!data) return [];
    if (applied.type === "income-expenditure" && "revenueLines" in data) {
      return [
        ...data.revenueLines.map((line) => ["Revenue", line.code, line.name, toNumber(line.amount)]),
        ...data.expenseLines.map((line) => ["Expense", line.code, line.name, toNumber(line.amount)]),
      ];
    }
    if (applied.type === "balance-sheet" && "assets" in data) {
      return [
        ...data.assets.map((line) => ["Asset", line.code, line.name, toNumber(line.amount)]),
        ...data.liabilities.map((line) => ["Liability", line.code, line.name, toNumber(line.amount)]),
        ...data.netAssets.map((line) => ["Net asset", line.code, line.name, toNumber(line.amount)]),
      ];
    }
    if (applied.type === "funds" && "funds" in data) {
      return data.funds.map((line) => [
        line.fundCode,
        line.fundName,
        line.fundType,
        toNumber(line.revenue),
        toNumber(line.expenses),
        toNumber(line.netActivity),
      ]);
    }
    return [];
  }, [applied.type, reportQuery.data]);

  if (fundsQuery.isLoading) return <LoadingState />;

  const data = reportQuery.data;

  return (
    <div className="space-y-4">
      <PageHeader title="Reports" description="Financial, fundraising, and budget reporting." />
      <ReportsNav />

      <PageHeader
        breadcrumbs={[{ label: "Financial reports" }]}
        title="Financial reports"
        action={
          <ExportActions
            filename={`financial-${applied.type}.csv`}
            headers={
              applied.type === "funds"
                ? ["Code", "Fund", "Type", "Revenue", "Expenses", "Net"]
                : ["Section", "Code", "Account", "Amount"]
            }
            rows={exportRows}
          />
        }
      />

      <div className="flex flex-wrap gap-2">
        {reportTypes.map((type) => (
          <button
            key={type.id}
            type="button"
            onClick={() => setReportType(type.id)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium ${
              reportType === type.id ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
            }`}
          >
            {type.label}
          </button>
        ))}
      </div>

      <ReportFilters
        fromDate={fromDate}
        toDate={toDate}
        onFromChange={setFromDate}
        onToChange={setToDate}
        onApply={applyFilters}
        onReset={resetFilters}
        showAsOf={reportType === "balance-sheet"}
        asOfDate={asOfDate}
        onAsOfChange={setAsOfDate}
        fundSelector={
          reportType === "funds" ? (
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Fund</p>
              <select
                className="h-10 min-w-[180px] rounded-md border border-input bg-surface px-3 text-sm"
                value={fundId}
                onChange={(e) => setFundId(e.target.value)}
              >
                <option value="">All funds</option>
                {(fundsQuery.data ?? []).map((fund) => (
                  <option key={fund.id} value={fund.id}>
                    {fund.code} — {fund.name}
                  </option>
                ))}
              </select>
            </div>
          ) : undefined
        }
      />

      {reportQuery.isLoading && <LoadingState />}
      {reportQuery.isError && <ErrorAlert message="Unable to load financial report." />}

      {data && applied.type === "income-expenditure" && "revenueLines" in data && (
        <div className="space-y-4">
          <ReportSummary
            metrics={[
              { label: "Total revenue", value: formatCurrency(toNumber(data.totalRevenue)) },
              { label: "Total expenses", value: formatCurrency(toNumber(data.totalExpenses)) },
              {
                label: "Net surplus",
                value: formatCurrency(toNumber(data.netSurplus)),
                variant: toNumber(data.netSurplus) >= 0 ? "success" : "danger",
              },
              {
                label: "Period",
                value:
                  data.fromDate && data.toDate
                    ? `${formatDate(data.fromDate)} – ${formatDate(data.toDate)}`
                    : "All time",
              },
            ]}
          />
          <section className="space-y-4">
            <SectionHeader title="Revenue" />
            <DataTable columns={lineColumns} data={data.revenueLines} />
          </section>
          <section className="space-y-4">
            <SectionHeader title="Expenses" />
            <DataTable columns={lineColumns} data={data.expenseLines} />
          </section>
        </div>
      )}

      {data && applied.type === "balance-sheet" && "totalAssets" in data && (
        <div className="space-y-4">
          <ReportSummary
            metrics={[
              { label: "Total assets", value: formatCurrency(toNumber(data.totalAssets)) },
              { label: "Total liabilities", value: formatCurrency(toNumber(data.totalLiabilities)) },
              { label: "Net assets", value: formatCurrency(toNumber(data.totalNetAssets)) },
              { label: "As of", value: formatDate(data.asOfDate) },
            ]}
          />
          <DataTable columns={lineColumns} data={data.assets} />
          <DataTable columns={lineColumns} data={data.liabilities} />
          <DataTable columns={lineColumns} data={data.netAssets} />
        </div>
      )}

      {data && applied.type === "cash-flow" && "closingCash" in data && (
        <ReportSummary
          metrics={[
            { label: "Opening cash", value: formatCurrency(toNumber(data.openingCash)) },
            { label: "Inflows", value: formatCurrency(toNumber(data.cashInflows)) },
            { label: "Outflows", value: formatCurrency(toNumber(data.cashOutflows)) },
            { label: "Closing cash", value: formatCurrency(toNumber(data.closingCash)) },
          ]}
        />
      )}

      {data && applied.type === "funds" && "funds" in data && (
        <div className="space-y-4">
          <ReportSummary
            metrics={[
              { label: "Total revenue", value: formatCurrency(toNumber(data.totalRevenue)) },
              { label: "Total expenses", value: formatCurrency(toNumber(data.totalExpenses)) },
              { label: "Net activity", value: formatCurrency(toNumber(data.totalNetActivity)) },
            ]}
          />
          <DataTable columns={fundColumns} data={data.funds} />
        </div>
      )}
    </div>
  );
}
