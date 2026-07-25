"use client";

import { useQuery } from "@tanstack/react-query";
import { type ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { useMemo, useState } from "react";

import { AccountingNav } from "@/components/accounting/accounting-nav";
import { JournalSourceLink } from "@/components/accounting/journal-source-link";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable } from "@/components/tables/data-table";
import { FilterBar } from "@/components/tables/filter-bar";
import { ErrorAlert } from "@/components/feedback/error-alert";
import { LoadingState } from "@/components/feedback/loading-state";
import { useAuth } from "@/hooks/use-auth";
import { listJournalEntries } from "@/lib/api/accounting";
import { formatCurrency, toNumber } from "@/lib/utils/format";
import { formatDate } from "@/lib/utils/dates";
import type { JournalEntryResponse } from "@/types/accounting";

export default function JournalEntriesPage() {
  const { accessToken } = useAuth();
  const [search, setSearch] = useState("");

  const entriesQuery = useQuery({
    queryKey: ["accounting", "journal-entries"],
    queryFn: async () => (await listJournalEntries(accessToken!)).data,
    enabled: Boolean(accessToken),
  });

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return (entriesQuery.data ?? []).filter(
      (e) =>
        e.description.toLowerCase().includes(q) ||
        String(e.id).includes(q) ||
        e.sourceType.toLowerCase().includes(q),
    );
  }, [entriesQuery.data, search]);

  const columns = useMemo<ColumnDef<JournalEntryResponse>[]>(
    () => [
      {
        accessorKey: "id",
        header: "Entry",
        cell: ({ row }) => (
          <Link
            href={`/accounting/journal-entries/${row.original.id}`}
            className="font-medium text-primary hover:underline"
          >
            #{row.original.id}
          </Link>
        ),
      },
      {
        accessorKey: "entryDate",
        header: "Date",
        cell: ({ row }) => formatDate(row.original.entryDate),
      },
      { accessorKey: "description", header: "Description" },
      {
        accessorKey: "source",
        header: "Source",
        cell: ({ row }) => (
          <JournalSourceLink sourceType={row.original.sourceType} sourceId={row.original.sourceId} />
        ),
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
    ],
    [],
  );

  if (entriesQuery.isLoading) return <LoadingState />;

  return (
    <div className="space-y-4">
      <AccountingNav />

      <PageHeader breadcrumbs={[{ label: "Accounting" }, { label: "Journal entries" }]} title="Journal entries" />

      {entriesQuery.isError && <ErrorAlert message="Unable to load journal entries." />}

      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search entries..."
        onReset={() => setSearch("")}
      />

      <DataTable columns={columns} data={filtered} globalFilter={search} />
    </div>
  );
}
