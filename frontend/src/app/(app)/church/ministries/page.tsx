"use client";

import { useQuery } from "@tanstack/react-query";
import { type ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { useMemo, useState } from "react";

import { PageHeader } from "@/components/layout/page-header";
import { PermissionGate } from "@/components/security/permission-gate";
import { DataTable } from "@/components/tables/data-table";
import { FilterBar } from "@/components/tables/filter-bar";
import { ErrorAlert } from "@/components/feedback/error-alert";
import { LoadingState } from "@/components/feedback/loading-state";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { listMinistries } from "@/lib/api/church";
import { formatDateTime } from "@/lib/utils/dates";
import type { MinistryResponse } from "@/types/verticals";

export default function MinistriesPage() {
  const { accessToken } = useAuth();
  const [search, setSearch] = useState("");

  const ministriesQuery = useQuery({
    queryKey: ["church", "ministries"],
    queryFn: async () => (await listMinistries(accessToken!)).data,
    enabled: Boolean(accessToken),
  });

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return (ministriesQuery.data ?? []).filter(
      (m) => m.name.toLowerCase().includes(q) || m.code.toLowerCase().includes(q),
    );
  }, [ministriesQuery.data, search]);

  const columns = useMemo<ColumnDef<MinistryResponse>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Ministry",
        cell: ({ row }) => (
          <Link href={`/church/ministries/${row.original.id}`} className="font-medium text-primary hover:underline">
            {row.original.name}
          </Link>
        ),
      },
      { accessorKey: "code", header: "Code" },
      { accessorKey: "leaderName", header: "Leader", cell: ({ row }) => row.original.leaderName ?? "—" },
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

  if (ministriesQuery.isLoading) return <LoadingState />;

  return (
    <div className="space-y-4">
      <PageHeader
        breadcrumbs={[{ label: "Church", href: "/church/ministries" }, { label: "Ministries" }]}
        title="Ministries"
        description="Church ministries and departments."
        action={
          <PermissionGate roles={["ORG_ADMIN", "STAFF"]}>
            <Button asChild>
              <Link href="/church/ministries/new">Add ministry</Link>
            </Button>
          </PermissionGate>
        }
      />
      {ministriesQuery.isError && <ErrorAlert message="Unable to load ministries." />}
      <FilterBar searchValue={search} onSearchChange={setSearch} searchPlaceholder="Search ministries..." onReset={() => setSearch("")} />
      <DataTable columns={columns} data={filtered} globalFilter={search} />
    </div>
  );
}
