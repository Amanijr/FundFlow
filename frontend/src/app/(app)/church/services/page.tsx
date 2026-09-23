"use client";

import { useQuery } from "@tanstack/react-query";
import { type ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { useMemo, useState } from "react";

import { ChurchNav } from "@/components/church/church-nav";
import { PageHeader } from "@/components/layout/page-header";
import { PermissionGate } from "@/components/security/permission-gate";
import { DataTable } from "@/components/tables/data-table";
import { FilterBar } from "@/components/tables/filter-bar";
import { ErrorAlert } from "@/components/feedback/error-alert";
import { LoadingState } from "@/components/feedback/loading-state";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { listServices } from "@/lib/api/church";
import { formatDate } from "@/lib/utils/dates";
import type { ServiceEventResponse } from "@/types/verticals";

export default function ServicesPage() {
  const { accessToken } = useAuth();
  const [search, setSearch] = useState("");

  const servicesQuery = useQuery({
    queryKey: ["church", "services"],
    queryFn: async () => (await listServices(accessToken!)).data,
    enabled: Boolean(accessToken),
  });

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return (servicesQuery.data ?? []).filter(
      (row) =>
        row.name.toLowerCase().includes(q) ||
        (row.ministryName ?? "").toLowerCase().includes(q) ||
        (row.location ?? "").toLowerCase().includes(q),
    );
  }, [servicesQuery.data, search]);

  const columns = useMemo<ColumnDef<ServiceEventResponse>[]>(
    () => [
      {
        accessorKey: "serviceDate",
        header: "Date",
        cell: ({ row }) => formatDate(row.original.serviceDate),
      },
      {
        accessorKey: "name",
        header: "Service",
        cell: ({ row }) => (
          <Link href={`/church/services/${row.original.id}`} className="font-medium text-primary hover:underline">
            {row.original.name}
          </Link>
        ),
      },
      { accessorKey: "ministryName", header: "Ministry", cell: ({ row }) => row.original.ministryName ?? "—" },
      {
        accessorKey: "attendanceCount",
        header: "Headcount",
        cell: ({ row }) => row.original.attendanceCount ?? "—",
      },
    ],
    [],
  );

  if (servicesQuery.isLoading) return <LoadingState />;

  return (
    <div className="space-y-4">
      <ChurchNav />
      <PageHeader
        breadcrumbs={[{ label: "Church", href: "/church" }, { label: "Services" }]}
        title="Services"
        description="Sunday and midweek gatherings. Record headcount on each service."
        action={
          <PermissionGate roles={["ORG_ADMIN", "FUNDRAISING_MANAGER", "FINANCE_MANAGER", "STAFF"]}>
            <Button asChild>
              <Link href="/church/services/new">Add service</Link>
            </Button>
          </PermissionGate>
        }
      />
      {servicesQuery.isError && <ErrorAlert message="Unable to load services." />}
      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search services..."
        onReset={() => setSearch("")}
      />
      <DataTable columns={columns} data={filtered} globalFilter={search} />
    </div>
  );
}
