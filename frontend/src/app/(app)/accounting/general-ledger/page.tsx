"use client";

import { useQuery } from "@tanstack/react-query";
import { type ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";

import { AccountingNav } from "@/components/accounting/accounting-nav";
import { ReportFilters } from "@/components/accounting/report-filters";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable } from "@/components/tables/data-table";
import { ErrorAlert } from "@/components/feedback/error-alert";
import { LoadingState } from "@/components/feedback/loading-state";
import { DetailCard } from "@/components/display/detail-card";
import { useAuth } from "@/hooks/use-auth";
import { getGeneralLedger, listChartOfAccounts } from "@/lib/api/accounting";
import { formatCurrency, toNumber } from "@/lib/utils/format";
import { formatDate, toApiDate } from "@/lib/utils/dates";
import type { GeneralLedgerLine } from "@/types/accounting";

export default function GeneralLedgerPage() {
  const { accessToken } = useAuth();
  const [accountId, setAccountId] = useState<string>("");
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [appliedAccountId, setAppliedAccountId] = useState<number | null>(null);
  const [appliedFrom, setAppliedFrom] = useState<string | undefined>();
  const [appliedTo, setAppliedTo] = useState<string | undefined>();

  const accountsQuery = useQuery({
    queryKey: ["accounting", "chart-of-accounts"],
    queryFn: async () => (await listChartOfAccounts(accessToken!)).data,
    enabled: Boolean(accessToken),
  });

  const ledgerQuery = useQuery({
    queryKey: ["accounting", "general-ledger", appliedAccountId, appliedFrom, appliedTo],
    queryFn: async () =>
      (await getGeneralLedger(accessToken!, appliedAccountId!, appliedFrom, appliedTo)).data,
    enabled: Boolean(accessToken) && appliedAccountId != null,
  });

  const columns = useMemo<ColumnDef<GeneralLedgerLine>[]>(
    () => [
      {
        accessorKey: "entryDate",
        header: "Date",
        cell: ({ row }) => formatDate(row.original.entryDate),
      },
      { accessorKey: "description", header: "Description" },
      {
        accessorKey: "debitAmount",
        header: "Debit",
        cell: ({ row }) => formatCurrency(toNumber(row.original.debitAmount)),
      },
      {
        accessorKey: "creditAmount",
        header: "Credit",
        cell: ({ row }) => formatCurrency(toNumber(row.original.creditAmount)),
      },
      {
        accessorKey: "runningBalance",
        header: "Balance",
        cell: ({ row }) => formatCurrency(toNumber(row.original.runningBalance)),
      },
    ],
    [],
  );

  function applyFilters() {
    if (!accountId) return;
    setAppliedAccountId(Number(accountId));
    setAppliedFrom(toApiDate(fromDate));
    setAppliedTo(toApiDate(toDate));
  }

  function resetFilters() {
    setFromDate(null);
    setToDate(null);
    if (accountId) {
      setAppliedAccountId(Number(accountId));
      setAppliedFrom(undefined);
      setAppliedTo(undefined);
    }
  }

  if (accountsQuery.isLoading) return <LoadingState />;

  const ledger = ledgerQuery.data;

  return (
    <div className="space-y-4">
      <AccountingNav />

      <PageHeader breadcrumbs={[{ label: "Accounting" }, { label: "General ledger" }]} title="General ledger" />

      <ReportFilters
        fromDate={fromDate}
        toDate={toDate}
        onFromChange={setFromDate}
        onToChange={setToDate}
        onApply={applyFilters}
        onReset={resetFilters}
        accountSelector={
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Account</p>
            <select
              className="h-10 min-w-[200px] rounded-md border border-input bg-surface px-3 text-sm"
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
            >
              <option value="">Select account</option>
              {(accountsQuery.data ?? []).map((account) => (
                <option key={account.id} value={account.id}>
                  {account.code} — {account.name}
                </option>
              ))}
            </select>
          </div>
        }
      />

      {!appliedAccountId && (
        <p className="text-sm text-muted-foreground">Select an account and apply filters to view ledger activity.</p>
      )}

      {ledgerQuery.isError && <ErrorAlert message="Unable to load general ledger." />}

      {ledger && (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <DetailCard
              title="Account"
              fields={[
                { label: "Code", value: ledger.accountCode },
                { label: "Name", value: ledger.accountName },
              ]}
            />
            <DetailCard
              title="Opening balance"
              fields={[{ label: "Balance", value: formatCurrency(toNumber(ledger.openingBalance)) }]}
            />
            <DetailCard
              title="Closing balance"
              fields={[{ label: "Balance", value: formatCurrency(toNumber(ledger.closingBalance)) }]}
            />
          </div>
          <DataTable columns={columns} data={ledger.lines} />
        </>
      )}
    </div>
  );
}
