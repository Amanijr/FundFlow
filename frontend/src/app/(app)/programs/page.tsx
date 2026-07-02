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
import { ProgramStatusBadge } from "@/components/verticals/vertical-status-badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { listPrograms } from "@/lib/api/programs";
import { formatDate } from "@/lib/utils/dates";
import type { ProgramResponse } from "@/types/verticals";

export default function ProgramsPage() {
  const { accessToken } = useAuth();
  const [search, setSearch] = useState("");

  const programsQuery = useQuery({
    queryKey: ["programs"],
    queryFn: async () => (await listPrograms(accessToken!)).data,
    enabled: Boolean(accessToken),
  });

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return (programsQuery.data ?? []).filter(
      (p) => p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q),
    );
  }, [programsQuery.data, search]);

  const columns = useMemo<ColumnDef<ProgramResponse>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Program",
        cell: ({ row }) => (
          <Link href={`/programs/${row.original.id}`} className="font-medium text-primary hover:underline">
            {row.original.name}
          </Link>
        ),
      },
      { accessorKey: "code", header: "Code" },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <ProgramStatusBadge status={row.original.status} />,
      },
      { accessorKey: "fundName", header: "Fund", cell: ({ row }) => row.original.fundName ?? "—" },
      {
        accessorKey: "startDate",
        header: "Start",
        cell: ({ row }) => (row.original.startDate ? formatDate(row.original.startDate) : "—"),
      },
      {
        accessorKey: "endDate",
        header: "End",
        cell: ({ row }) => (row.original.endDate ? formatDate(row.original.endDate) : "—"),
      },
    ],
    [],
  );

  if (programsQuery.isLoading) return <LoadingState />;

  return (
    <div className="space-y-4">
      <PageHeader
        breadcrumbs={[{ label: "Programs", href: "/programs" }]}
        title="Programs"
        description="Operational programs and linked funds."
        action={
          <PermissionGate roles={["ORG_ADMIN", "PROGRAM_MANAGER"]}>
            <Button asChild>
              <Link href="/programs/new">Create program</Link>
            </Button>
          </PermissionGate>
        }
      />
      {programsQuery.isError && <ErrorAlert message="Unable to load programs." />}
      <FilterBar searchValue={search} onSearchChange={setSearch} searchPlaceholder="Search programs..." onReset={() => setSearch("")} />
      <DataTable columns={columns} data={filtered} globalFilter={search} />
    </div>
  );
}
