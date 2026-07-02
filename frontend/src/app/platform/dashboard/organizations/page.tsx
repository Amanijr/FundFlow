"use client";

import { useQuery } from "@tanstack/react-query";
import { type ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { useMemo, useState } from "react";

import { ErrorAlert } from "@/components/feedback/error-alert";
import { LoadingState } from "@/components/feedback/loading-state";
import { formatEnumLabel } from "@/components/finance/finance-status-badge";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable } from "@/components/tables/data-table";
import { FilterBar } from "@/components/tables/filter-bar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { listPlatformOrganizations } from "@/lib/api/platform";
import { formatDateTime } from "@/lib/utils/dates";
import type { PlatformOrganization } from "@/types/platform";

export default function PlatformOrganizationsPage() {
  const { accessToken } = useAuth();
  const [search, setSearch] = useState("");

  const organizationsQuery = useQuery({
    queryKey: ["platform", "organizations"],
    queryFn: async () => (await listPlatformOrganizations(accessToken!)).data,
    enabled: Boolean(accessToken),
  });

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return (organizationsQuery.data ?? []).filter(
      (org) => org.name.toLowerCase().includes(q) || org.slug.toLowerCase().includes(q),
    );
  }, [organizationsQuery.data, search]);

  const columns = useMemo<ColumnDef<PlatformOrganization>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Organization",
        cell: ({ row }) => (
          <Link
            href={`/platform/dashboard/organizations/${row.original.id}`}
            className="font-medium text-primary hover:underline"
          >
            {row.original.name}
          </Link>
        ),
      },
      { accessorKey: "slug", header: "Slug" },
      {
        accessorKey: "type",
        header: "Type",
        cell: ({ row }) => formatEnumLabel(row.original.type),
      },
      { accessorKey: "email", header: "Email", cell: ({ row }) => row.original.email ?? "—" },
      {
        accessorKey: "active",
        header: "Status",
        cell: ({ row }) => (
          <Badge variant={row.original.active ? "success" : "secondary"}>
            {row.original.active ? "Active" : "Inactive"}
          </Badge>
        ),
      },
      {
        accessorKey: "createdAt",
        header: "Created",
        cell: ({ row }) => formatDateTime(row.original.createdAt),
      },
    ],
    [],
  );

  if (organizationsQuery.isLoading) return <LoadingState />;

  return (
    <div className="space-y-4">
      <PageHeader
        breadcrumbs={[{ label: "Organizations" }]}
        title="Organizations"
        description="All tenants registered on the platform."
      />
      {organizationsQuery.isError && <ErrorAlert message="Unable to load organizations." />}
      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search organizations..."
        onReset={() => setSearch("")}
      />
      <DataTable columns={columns} data={filtered} globalFilter={search} />
    </div>
  );
}
