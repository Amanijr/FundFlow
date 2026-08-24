"use client";

import { useQuery } from "@tanstack/react-query";
import { type ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";

import { AccountLabel } from "@/components/accounting/account-label";
import { AccountingNav } from "@/components/accounting/accounting-nav";
import { formatEnumLabel } from "@/components/finance/finance-status-badge";
import { PageHeader } from "@/components/layout/page-header";
import { SectionHeader } from "@/components/layout/section-header";
import { DataTable } from "@/components/tables/data-table";
import { ErrorAlert } from "@/components/feedback/error-alert";
import { LoadingState } from "@/components/feedback/loading-state";
import { MetricCard } from "@/components/charts/metric-card";
import { useAuth } from "@/hooks/use-auth";
import { getTrialBalance } from "@/lib/api/accounting";
import { formatCurrency, toNumber } from "@/lib/utils/format";
import type { TrialBalanceLine } from "@/types/accounting";

export default function TrialBalancePage() {
  const { accessToken } = useAuth();

  const trialBalanceQuery = useQuery({
    queryKey: ["accounting", "trial-balance"],
    queryFn: async () => (await getTrialBalance(accessToken!)).data,
    enabled: Boolean(accessToken),
  });

  const columns = useMemo<ColumnDef<TrialBalanceLine>[]>(
    () => [
      {
        accessorKey: "accountName",
        header: "Account",
        cell: ({ row }) => (
          <AccountLabel name={row.original.accountName} code={row.original.accountCode} />
        ),
      },
      {
        accessorKey: "accountType",
        header: "Type",
        cell: ({ row }) => formatEnumLabel(row.original.accountType),
      },
      {
        accessorKey: "totalDebits",
        header: "Debits",
        cell: ({ row }) => formatCurrency(toNumber(row.original.totalDebits)),
      },
      {
        accessorKey: "totalCredits",
        header: "Credits",
        cell: ({ row }) => formatCurrency(toNumber(row.original.totalCredits)),
      },
      {
        accessorKey: "balance",
        header: "Balance",
        cell: ({ row }) => formatCurrency(toNumber(row.original.balance)),
      },
    ],
    [],
  );

  if (trialBalanceQuery.isLoading) return <LoadingState />;
  if (trialBalanceQuery.isError || !trialBalanceQuery.data) {
    return <ErrorAlert message="Unable to load trial balance." />;
  }

  const report = trialBalanceQuery.data;

  return (
    <div className="space-y-4">
      <AccountingNav />

      <PageHeader breadcrumbs={[{ label: "Accounting" }, { label: "Trial balance" }]} title="Trial balance" />

      <div className="grid gap-4 md:grid-cols-2">
        <MetricCard label="Total debits" value={formatCurrency(toNumber(report.totalDebits))} />
        <MetricCard label="Total credits" value={formatCurrency(toNumber(report.totalCredits))} />
      </div>

      <section className="space-y-4">
        <SectionHeader title="Accounts" description="Debit and credit balances by account" />
        <DataTable columns={columns} data={report.lines} />
      </section>
    </div>
  );
}
