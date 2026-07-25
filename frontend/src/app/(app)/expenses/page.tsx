"use client";

import { useQuery } from "@tanstack/react-query";
import { type ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { useMemo, useState } from "react";

import { CurrencyCell } from "@/components/data";
import { ExpenseStatusBadge, formatEnumLabel } from "@/components/finance/finance-status-badge";
import { PageHeader } from "@/components/layout/page-header";
import { PermissionGate } from "@/components/security/permission-gate";
import { DataTable } from "@/components/tables/data-table";
import { FilterBar } from "@/components/tables/filter-bar";
import { ErrorAlert } from "@/components/feedback/error-alert";
import { LoadingState } from "@/components/feedback/loading-state";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { listExpenses } from "@/lib/api/expenses";
import { toNumber } from "@/lib/utils/format";
import { formatDateTime } from "@/lib/utils/dates";
import type { ExpenseResponse } from "@/types/finance";

export default function ExpensesPage() {
  const { accessToken } = useAuth();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const expensesQuery = useQuery({
    queryKey: ["expenses"],
    queryFn: async () => (await listExpenses(accessToken!)).data,
    enabled: Boolean(accessToken),
  });

  const filtered = useMemo(() => {
    return (expensesQuery.data ?? []).filter((e) => {
      const matchesSearch = e.title.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "ALL" || e.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [expensesQuery.data, search, statusFilter]);

  const columns = useMemo<ColumnDef<ExpenseResponse>[]>(
    () => [
      {
        accessorKey: "title",
        header: "Expense",
        cell: ({ row }) => (
          <Link href={`/expenses/${row.original.id}`} className="font-medium text-primary hover:underline">
            {row.original.title}
          </Link>
        ),
      },
      {
        accessorKey: "amount",
        header: () => <span className="block text-right">Amount</span>,
        cell: ({ row }) => <CurrencyCell value={toNumber(row.original.amount)} />,
      },
      {
        accessorKey: "category",
        header: "Category",
        cell: ({ row }) => formatEnumLabel(row.original.category),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <ExpenseStatusBadge status={row.original.status} />,
      },
      {
        accessorKey: "createdAt",
        header: "Created",
        cell: ({ row }) => formatDateTime(row.original.createdAt),
      },
    ],
    [],
  );

  const chips = statusFilter !== "ALL" ? [{ id: "status", label: `Status: ${formatEnumLabel(statusFilter)}` }] : [];

  if (expensesQuery.isLoading) return <LoadingState />;

  return (
    <div className="space-y-4">
      <PageHeader
        breadcrumbs={[{ label: "Expenses", href: "/expenses" }]}
        title="Expenses"
        description="Expense requests from draft through payment."
        action={
          <PermissionGate roles={["ORG_ADMIN", "FINANCE_MANAGER", "STAFF"]}>
            <Button asChild>
              <Link href="/expenses/new">Create expense</Link>
            </Button>
          </PermissionGate>
        }
      />
      {expensesQuery.isError && <ErrorAlert message="Unable to load expenses." />}
      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search expenses..."
        activeChips={chips}
        onRemoveChip={() => setStatusFilter("ALL")}
        onReset={() => {
          setSearch("");
          setStatusFilter("ALL");
        }}
        filters={
          <select
            className="h-10 rounded-md border border-input bg-surface px-3 text-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="PAID">Paid</option>
            <option value="RECONCILED">Reconciled</option>
          </select>
        }
      />
      <DataTable columns={columns} data={filtered} globalFilter={search} />
    </div>
  );
}
