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
import { GrantStatusBadge } from "@/components/verticals/vertical-status-badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { listGrants } from "@/lib/api/grants";
import { formatCurrency, toNumber } from "@/lib/utils/format";
import { formatDate } from "@/lib/utils/dates";
import type { GrantResponse } from "@/types/verticals";

export default function GrantsPage() {
  const { accessToken } = useAuth();
  const [search, setSearch] = useState("");

  const grantsQuery = useQuery({
    queryKey: ["grants"],
    queryFn: async () => (await listGrants(accessToken!)).data,
    enabled: Boolean(accessToken),
  });

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return (grantsQuery.data ?? []).filter(
      (g) =>
        g.name.toLowerCase().includes(q) ||
        g.grantCode.toLowerCase().includes(q) ||
        g.funderName.toLowerCase().includes(q),
    );
  }, [grantsQuery.data, search]);

  const columns = useMemo<ColumnDef<GrantResponse>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Grant",
        cell: ({ row }) => (
          <Link href={`/grants/${row.original.id}`} className="font-medium text-primary hover:underline">
            {row.original.name}
          </Link>
        ),
      },
      { accessorKey: "grantCode", header: "Code" },
      { accessorKey: "funderName", header: "Funder" },
      {
        accessorKey: "awardedAmount",
        header: "Awarded",
        cell: ({ row }) => formatCurrency(toNumber(row.original.awardedAmount)),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <GrantStatusBadge status={row.original.status} />,
      },
      {
        accessorKey: "restrictionType",
        header: "Restriction",
        cell: ({ row }) => formatEnumLabel(row.original.restrictionType),
      },
      {
        accessorKey: "endDate",
        header: "End date",
        cell: ({ row }) => formatDate(row.original.endDate),
      },
    ],
    [],
  );

  if (grantsQuery.isLoading) return <LoadingState />;

  return (
    <div className="space-y-4">
      <PageHeader
        breadcrumbs={[{ label: "Grants", href: "/grants" }]}
        title="Grants"
        description="Grant awards, restrictions, and utilization."
        action={
          <PermissionGate roles={["ORG_ADMIN", "FINANCE_MANAGER", "PROGRAM_MANAGER"]}>
            <Button asChild>
              <Link href="/grants/new">Create grant</Link>
            </Button>
          </PermissionGate>
        }
      />
      {grantsQuery.isError && <ErrorAlert message="Unable to load grants." />}
      <FilterBar searchValue={search} onSearchChange={setSearch} searchPlaceholder="Search grants..." onReset={() => setSearch("")} />
      <DataTable columns={columns} data={filtered} globalFilter={search} />
    </div>
  );
}
