"use client";

import { useQuery } from "@tanstack/react-query";
import { type ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { useMemo, useState } from "react";

import { formatEnumLabel } from "@/components/finance/finance-status-badge";
import { PageHeader } from "@/components/layout/page-header";
import { PermissionGate } from "@/components/security/permission-gate";
import { DataTable } from "@/components/tables/data-table";
import { FilterBar } from "@/components/tables/filter-bar";
import { ErrorAlert } from "@/components/feedback/error-alert";
import { LoadingState } from "@/components/feedback/loading-state";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { listFunds } from "@/lib/api/funds";
import { formatCurrency, toNumber } from "@/lib/utils/format";
import type { FundResponse } from "@/types/finance";

export default function FundsPage() {
  const { accessToken } = useAuth();
  const [search, setSearch] = useState("");

  const fundsQuery = useQuery({
    queryKey: ["funds"],
    queryFn: async () => (await listFunds(accessToken!)).data,
    enabled: Boolean(accessToken),
  });

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return (fundsQuery.data ?? []).filter(
      (f) => f.name.toLowerCase().includes(q) || f.code.toLowerCase().includes(q),
    );
  }, [fundsQuery.data, search]);

  const columns = useMemo<ColumnDef<FundResponse>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Fund",
        cell: ({ row }) => (
          <Link href={`/funds/${row.original.id}`} className="font-medium text-primary hover:underline">
            {row.original.name}
          </Link>
        ),
      },
      { accessorKey: "code", header: "Code" },
      {
        accessorKey: "type",
        header: "Type",
        cell: ({ row }) => formatEnumLabel(row.original.type),
      },
      {
        accessorKey: "currentBalance",
        header: "Balance",
        cell: ({ row }) => formatCurrency(toNumber(row.original.currentBalance)),
      },
      {
        accessorKey: "active",
        header: "Status",
        cell: ({ row }) => (
          <Badge variant={row.original.active ? "success" : "secondary"}>
            {row.original.active ? "Active" : "Inactive"}
          </Badge>
        ),
      },
    ],
    [],
  );

  if (fundsQuery.isLoading) return <LoadingState />;

  return (
    <div className="space-y-4">
      <PageHeader
        breadcrumbs={[{ label: "Funds", href: "/funds" }]}
        title="Funds"
        description="Operational and restricted fund balances."
        action={
          <PermissionGate roles={["ORG_ADMIN", "FINANCE_MANAGER"]}>
            <Button asChild>
              <Link href="/funds/new">Create fund</Link>
            </Button>
          </PermissionGate>
        }
      />
      {fundsQuery.isError && <ErrorAlert message="Unable to load funds." />}
      <FilterBar searchValue={search} onSearchChange={setSearch} searchPlaceholder="Search funds..." onReset={() => setSearch("")} />
      <DataTable columns={columns} data={filtered} globalFilter={search} />
    </div>
  );
}
