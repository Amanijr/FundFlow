"use client";

import { useQuery } from "@tanstack/react-query";
import { type ColumnDef } from "@tanstack/react-table";
import { useParams } from "next/navigation";
import { useMemo } from "react";

import { AccountLabel } from "@/components/accounting/account-label";
import { AccountingNav } from "@/components/accounting/accounting-nav";
import { DetailCard } from "@/components/display/detail-card";
import { ErrorAlert } from "@/components/feedback/error-alert";
import { LoadingState } from "@/components/feedback/loading-state";
import { JournalSourceLink } from "@/components/accounting/journal-source-link";
import { PageHeader } from "@/components/layout/page-header";
import { SectionHeader } from "@/components/layout/section-header";
import { DataTable } from "@/components/tables/data-table";
import { useAuth } from "@/hooks/use-auth";
import { getJournalEntry } from "@/lib/api/accounting";
import { formatCurrency, toNumber } from "@/lib/utils/format";
import { formatDate } from "@/lib/utils/dates";
import type { JournalLineResponse } from "@/types/accounting";

export default function JournalEntryDetailPage() {
  const params = useParams();
  const { accessToken } = useAuth();
  const entryId = Number(params.id);

  const entryQuery = useQuery({
    queryKey: ["accounting", "journal-entries", entryId],
    queryFn: async () => (await getJournalEntry(accessToken!, entryId)).data,
    enabled: Boolean(accessToken) && !Number.isNaN(entryId),
  });

  const lineColumns = useMemo<ColumnDef<JournalLineResponse>[]>(
    () => [
      {
        accessorKey: "accountName",
        header: "Account",
        cell: ({ row }) => (
          <AccountLabel name={row.original.accountName} code={row.original.accountCode} />
        ),
      },
      { accessorKey: "fundName", header: "Fund", cell: ({ row }) => row.original.fundName ?? "—" },
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
        accessorKey: "lineDescription",
        header: "Line note",
        cell: ({ row }) => row.original.lineDescription ?? "—",
      },
    ],
    [],
  );

  if (entryQuery.isLoading) return <LoadingState />;
  if (entryQuery.isError || !entryQuery.data) return <ErrorAlert message="Unable to load journal entry." />;

  const entry = entryQuery.data;

  return (
    <div className="space-y-4">
      <AccountingNav />

      <PageHeader
        breadcrumbs={[
          { label: "Accounting" },
          { label: "Journal entries", href: "/accounting/journal-entries" },
          { label: `Entry #${entry.id}` },
        ]}
        title={`Journal entry #${entry.id}`}
        description={entry.description}
      />

      <DetailCard
        title="Entry details"
        fields={[
          { label: "Date", value: formatDate(entry.entryDate) },
          { label: "Fiscal period", value: entry.fiscalPeriodName ?? "—" },
          {
            label: "Source",
            value: <JournalSourceLink sourceType={entry.sourceType} sourceId={entry.sourceId} />,
          },
          { label: "Total debits", value: formatCurrency(toNumber(entry.totalDebits)) },
          { label: "Total credits", value: formatCurrency(toNumber(entry.totalCredits)) },
        ]}
      />

      <section className="space-y-4">
        <SectionHeader title="Journal lines" />
        <DataTable columns={lineColumns} data={entry.lines} />
      </section>
    </div>
  );
}
