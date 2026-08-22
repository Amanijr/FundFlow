"use client";

import { useQuery } from "@tanstack/react-query";
import { type ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { useMemo, useState } from "react";

import { ChurchNav } from "@/components/church/church-nav";
import { CollectionStatusBadge } from "@/components/church/collection-status-badge";
import { CurrencyCell } from "@/components/data";
import { ErrorAlert } from "@/components/feedback/error-alert";
import { LoadingState } from "@/components/feedback/loading-state";
import { PageHeader } from "@/components/layout/page-header";
import { PermissionGate } from "@/components/security/permission-gate";
import { DataTable } from "@/components/tables/data-table";
import { FilterBar } from "@/components/tables/filter-bar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { getCollectionDashboard, listCollectionSessions } from "@/lib/api/collections";
import { collectionStatusLabel, collectionTypeLabel } from "@/lib/church/labels";
import { formatCurrency, toNumber } from "@/lib/utils/format";
import { formatDate } from "@/lib/utils/dates";
import type { CollectionSessionResponse, CollectionSessionStatus } from "@/types/collection";

export default function ChurchCollectionsPage() {
  const { accessToken } = useAuth();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const sessionsQuery = useQuery({
    queryKey: ["church", "collections"],
    queryFn: async () => (await listCollectionSessions(accessToken!)).data,
    enabled: Boolean(accessToken),
  });

  const dashboardQuery = useQuery({
    queryKey: ["church", "collections", "dashboard"],
    queryFn: async () => (await getCollectionDashboard(accessToken!)).data,
    enabled: Boolean(accessToken),
  });

  const filtered = useMemo(() => {
    return (sessionsQuery.data ?? []).filter((session) => {
      const haystack = `${session.title ?? ""} ${session.location ?? ""} ${session.collectionType}`.toLowerCase();
      const matchesSearch = haystack.includes(search.toLowerCase());
      const matchesStatus = statusFilter === "ALL" || session.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [search, sessionsQuery.data, statusFilter]);

  const columns = useMemo<ColumnDef<CollectionSessionResponse>[]>(
    () => [
      {
        accessorKey: "title",
        header: "Collection",
        cell: ({ row }) => (
          <Link
            href={`/church/collections/${row.original.id}`}
            className="font-medium text-primary hover:underline"
          >
            {row.original.title || collectionTypeLabel(row.original.collectionType)}
          </Link>
        ),
      },
      {
        accessorKey: "collectionType",
        header: "Type",
        cell: ({ row }) => collectionTypeLabel(row.original.collectionType),
      },
      {
        accessorKey: "totalAmount",
        header: () => <span className="block text-right">Amount</span>,
        cell: ({ row }) =>
          row.original.totalAmount != null ? (
            <CurrencyCell value={toNumber(row.original.totalAmount)} />
          ) : (
            "—"
          ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <CollectionStatusBadge status={row.original.status} />,
      },
      {
        accessorKey: "collectedAt",
        header: "Service date",
        cell: ({ row }) => formatDate(row.original.collectedAt ?? row.original.createdAt),
      },
    ],
    [],
  );

  if (sessionsQuery.isLoading) return <LoadingState />;

  const dashboard = dashboardQuery.data;
  const statuses: Array<"ALL" | CollectionSessionStatus> = [
    "ALL",
    "DRAFT",
    "COUNTED",
    "VERIFIED",
    "DEPOSITED",
  ];

  return (
    <div className="space-y-4">
      <ChurchNav />
      <PageHeader
        breadcrumbs={[{ label: "Church", href: "/church" }, { label: "Sunday collections" }]}
        title="Sunday collections"
        description="Count the plate or Lipa total. Treasurer verifies, then the books post automatically."
        action={
          <PermissionGate roles={["ORG_ADMIN", "FUNDRAISING_MANAGER", "STAFF"]}>
            <Button asChild>
              <Link href="/church/collections/new">New collection</Link>
            </Button>
          </PermissionGate>
        }
      />

      {dashboard && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-border bg-surface p-4">
            <p className="text-sm text-muted-foreground">Verified offerings</p>
            <p className="mt-1 text-2xl font-semibold">
              {formatCurrency(toNumber(dashboard.totalVerifiedAmount))}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-surface p-4">
            <p className="text-sm text-muted-foreground">Services verified</p>
            <p className="mt-1 text-2xl font-semibold">{dashboard.totalVerifiedSessions}</p>
          </div>
        </div>
      )}

      {sessionsQuery.isError && <ErrorAlert message="Unable to load collections." />}

      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search collections..."
        onReset={() => {
          setSearch("");
          setStatusFilter("ALL");
        }}
        filters={
          <select
            className="h-9 rounded-md border border-input bg-surface px-2.5 text-sm"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status === "ALL" ? "All statuses" : collectionStatusLabel(status)}
              </option>
            ))}
          </select>
        }
      />

      <DataTable columns={columns} data={filtered} globalFilter={search} />
    </div>
  );
}
