"use client";

import { useQuery } from "@tanstack/react-query";
import { type ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { useMemo, useState } from "react";

import { BudgetStatusBadge, formatEnumLabel } from "@/components/finance/finance-status-badge";
import { PageHeader } from "@/components/layout/page-header";
import { PermissionGate } from "@/components/security/permission-gate";
import { DataTable } from "@/components/tables/data-table";
import { FilterBar } from "@/components/tables/filter-bar";
import { ErrorAlert } from "@/components/feedback/error-alert";
import { LoadingState } from "@/components/feedback/loading-state";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { listBudgets } from "@/lib/api/budgets";
import { formatCurrency, toNumber } from "@/lib/utils/format";
import { formatDate } from "@/lib/utils/dates";
import type { BudgetResponse } from "@/types/finance";

export default function BudgetsPage() {
  const { accessToken } = useAuth();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const budgetsQuery = useQuery({
    queryKey: ["budgets"],
    queryFn: async () => (await listBudgets(accessToken!)).data,
    enabled: Boolean(accessToken),
  });

  const filtered = useMemo(() => {
    return (budgetsQuery.data ?? []).filter((b) => {
      const matchesSearch = b.name.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "ALL" || b.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [budgetsQuery.data, search, statusFilter]);

  const columns = useMemo<ColumnDef<BudgetResponse>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Budget",
        cell: ({ row }) => (
          <Link href={`/budgets/${row.original.id}`} className="font-medium text-primary hover:underline">
            {row.original.name}
          </Link>
        ),
      },
      { accessorKey: "fiscalYear", header: "Fiscal year" },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <BudgetStatusBadge status={row.original.status} />,
      },
      {
        accessorKey: "totalBudget",
        header: "Total",
        cell: ({ row }) => formatCurrency(toNumber(row.original.totalBudget)),
      },
      {
        accessorKey: "period",
        header: "Period",
        cell: ({ row }) => `${formatDate(row.original.startDate)} – ${formatDate(row.original.endDate)}`,
      },
    ],
    [],
  );

  const chips = statusFilter !== "ALL" ? [{ id: "status", label: `Status: ${formatEnumLabel(statusFilter)}` }] : [];

  if (budgetsQuery.isLoading) return <LoadingState />;

  return (
    <div className="space-y-4">
      <PageHeader
        breadcrumbs={[{ label: "Budgets", href: "/budgets" }]}
        title="Budgets"
        description="Plan, approve, and track budget utilization."
        action={
          <PermissionGate roles={["ORG_ADMIN", "FINANCE_MANAGER"]}>
            <Button asChild>
              <Link href="/budgets/new">Create budget</Link>
            </Button>
          </PermissionGate>
        }
      />
      {budgetsQuery.isError && <ErrorAlert message="Unable to load budgets." />}
      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search budgets..."
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
            <option value="APPROVED">Approved</option>
            <option value="ACTIVE">Active</option>
            <option value="CLOSED">Closed</option>
          </select>
        }
      />
      <DataTable columns={columns} data={filtered} globalFilter={search} />
    </div>
  );
}
