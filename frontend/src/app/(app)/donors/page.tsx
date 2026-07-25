"use client";

import { useQuery } from "@tanstack/react-query";
import { type ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import Link from "next/link";
import { useMemo, useState } from "react";

import {
  DataErrorState,
  DataTable,
  DateCell,
  FilterBar,
  RowActionsMenu,
} from "@/components/data";
import { PageHeader } from "@/components/layout/page-header";
import { PermissionGate } from "@/components/security/permission-gate";
import { LoadingState } from "@/components/feedback/loading-state";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { listDonors } from "@/lib/api/donors";
import { downloadCsv } from "@/lib/utils/csv-export";
import { formatDate } from "@/lib/utils/dates";
import type { DonorResponse } from "@/types/fundraising";

function exportDonors(donors: DonorResponse[]) {
  downloadCsv(
    `donors-${format(new Date(), "yyyy-MM-dd")}.csv`,
    ["Donor", "Email", "Phone", "Added"],
    donors.map((donor) => [
      `${donor.firstName} ${donor.lastName}`,
      donor.email,
      donor.phone ?? "",
      formatDate(donor.createdAt),
    ]),
  );
}

export default function DonorsPage() {
  const { accessToken } = useAuth();
  const [search, setSearch] = useState("");

  const donorsQuery = useQuery({
    queryKey: ["donors"],
    queryFn: async () => {
      const response = await listDonors(accessToken!);
      return response.data;
    },
    enabled: Boolean(accessToken),
  });

  const filtered = useMemo(() => {
    const donors = donorsQuery.data ?? [];
    const q = search.toLowerCase().trim();
    if (!q) {
      return donors;
    }
    return donors.filter(
      (donor) =>
        `${donor.firstName} ${donor.lastName}`.toLowerCase().includes(q) ||
        donor.email.toLowerCase().includes(q),
    );
  }, [donorsQuery.data, search]);

  const columns = useMemo<ColumnDef<DonorResponse>[]>(
    () => [
      {
        id: "name",
        accessorKey: "name",
        header: "Donor",
        meta: { label: "Donor", exportHeader: "Donor" },
        cell: ({ row }) => (
          <Link href={`/donors/${row.original.id}`} className="font-medium text-primary hover:underline">
            {row.original.firstName} {row.original.lastName}
          </Link>
        ),
      },
      {
        accessorKey: "email",
        header: "Email",
        meta: { label: "Email" },
      },
      {
        accessorKey: "phone",
        header: "Phone",
        meta: { label: "Phone", hiddenOnMobile: true },
        cell: ({ row }) => row.original.phone ?? "—",
      },
      {
        accessorKey: "createdAt",
        header: "Added",
        meta: { label: "Added", type: "date", hiddenOnTablet: true },
        cell: ({ row }) => <DateCell value={row.original.createdAt} />,
      },
      {
        id: "actions",
        header: "",
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => (
          <RowActionsMenu
            items={[
              { label: "View", href: `/donors/${row.original.id}` },
              { label: "Edit", href: `/donors/${row.original.id}/edit` },
              {
                label: "Delete",
                variant: "destructive",
                separatorBefore: true,
                hidden: true,
              },
            ]}
          />
        ),
      },
    ],
    [],
  );

  const emptyTitle = (donorsQuery.data?.length ?? 0) === 0 ? "No donors yet" : "No matches found";
  const emptyDescription =
    (donorsQuery.data?.length ?? 0) === 0
      ? "Add your first donor to start tracking relationships."
      : "Try a different search term or clear filters.";

  if (donorsQuery.isLoading) {
    return <LoadingState layout="list" />;
  }

  if (donorsQuery.isError) {
    return (
      <div className="space-y-4">
        <PageHeader
          breadcrumbs={[{ label: "Donors", href: "/donors" }]}
          title="Donors"
          description="Manage donor relationships and giving history."
        />
        <DataErrorState onRetry={() => donorsQuery.refetch()} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PageHeader
        breadcrumbs={[{ label: "Donors", href: "/donors" }]}
        title="Donors"
        description="Manage donor relationships and giving history."
        action={
          <PermissionGate roles={["ORG_ADMIN", "FUNDRAISING_MANAGER", "FINANCE_MANAGER", "STAFF"]}>
            <Button asChild>
              <Link href="/donors/new">Add donor</Link>
            </Button>
          </PermissionGate>
        }
      />

      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search donors..."
        activeChips={search ? [{ id: "search", label: `Search: "${search}"` }] : []}
        onRemoveChip={(id) => {
          if (id === "search") setSearch("");
        }}
        onReset={() => setSearch("")}
      />

      <DataTable
        columns={columns}
        data={filtered}
        globalFilter={search}
        getRowId={(row) => String(row.id)}
        onExportCsv={() => exportDonors(filtered)}
        emptyTitle={emptyTitle}
        emptyDescription={emptyDescription}
      />
    </div>
  );
}
