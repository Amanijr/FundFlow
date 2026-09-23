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
import { ChurchNav } from "@/components/church/church-nav";
import { PageHeader } from "@/components/layout/page-header";
import { PermissionGate } from "@/components/security/permission-gate";
import { LoadingState } from "@/components/feedback/loading-state";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { listPeople } from "@/lib/api/donors";
import { peopleCopy } from "@/lib/people/copy";
import { peopleListPath, peopleNewPath, personEditPath, personPath, type PeopleModule } from "@/lib/people/module";
import { downloadCsv } from "@/lib/utils/csv-export";
import { formatDate } from "@/lib/utils/dates";
import type { DonorResponse } from "@/types/fundraising";

function exportPeople(module: PeopleModule, people: DonorResponse[]) {
  const copy = peopleCopy(module);
  downloadCsv(
    `${copy.nounPlural}-${format(new Date(), "yyyy-MM-dd")}.csv`,
    [copy.title.replace(/s$/, ""), ...(module === "members" ? ["Member number"] : []), "Email", "Phone", "Status", "Added"],
    people.map((person) => [
      `${person.firstName} ${person.lastName}`,
      ...(module === "members" ? [person.memberNumber ?? ""] : []),
      person.email ?? "",
      person.phone ?? "",
      person.membershipStatus ?? "ACTIVE",
      formatDate(person.createdAt),
    ]),
  );
}

export function PeopleListPage({ module }: { module: PeopleModule }) {
  const { accessToken } = useAuth();
  const copy = peopleCopy(module);
  const basePath = peopleListPath(module);
  const [search, setSearch] = useState("");

  const peopleQuery = useQuery({
    queryKey: ["people", module],
    queryFn: async () => {
      const response = await listPeople(accessToken!, module);
      return response.data;
    },
    enabled: Boolean(accessToken),
  });

  const filtered = useMemo(() => {
    const people = peopleQuery.data ?? [];
    const q = search.toLowerCase().trim();
    if (!q) {
      return people;
    }
    return people.filter(
      (person) =>
        `${person.firstName} ${person.lastName}`.toLowerCase().includes(q) ||
        person.memberNumber?.toLowerCase().includes(q) ||
        person.email?.toLowerCase().includes(q) ||
        person.phone?.toLowerCase().includes(q),
    );
  }, [peopleQuery.data, search]);

  const columns = useMemo<ColumnDef<DonorResponse>[]>(
    () => [
      {
        id: "name",
        accessorKey: "name",
        header: copy.title,
        meta: { label: copy.title, exportHeader: copy.title },
        cell: ({ row }) => (
          <Link href={personPath(module, row.original.id)} className="font-medium text-primary hover:underline">
            {row.original.firstName} {row.original.lastName}
          </Link>
        ),
      },
      ...(module === "members"
        ? [
            {
              accessorKey: "memberNumber",
              header: "Member no.",
              meta: { label: "Member number" },
              cell: ({ row }) => (
                <span className="font-mono text-sm">{row.original.memberNumber ?? "—"}</span>
              ),
            } satisfies ColumnDef<DonorResponse>,
          ]
        : []),
      {
        accessorKey: "email",
        header: "Email",
        meta: { label: "Email" },
        cell: ({ row }) => row.original.email ?? "—",
      },
      {
        accessorKey: "phone",
        header: "Phone",
        meta: { label: "Phone", hiddenOnMobile: true },
        cell: ({ row }) => row.original.phone ?? "—",
      },
      {
        accessorKey: "membershipStatus",
        header: "Status",
        meta: { label: "Status" },
        cell: ({ row }) => row.original.membershipStatus ?? "ACTIVE",
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
              { label: "View", href: personPath(module, row.original.id) },
              { label: "Edit", href: personEditPath(module, row.original.id) },
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
    [copy.title, module],
  );

  const emptyTitle = (peopleQuery.data?.length ?? 0) === 0 ? copy.emptyTitle : "No matches found";
  const emptyDescription =
    (peopleQuery.data?.length ?? 0) === 0
      ? copy.emptyDescription
      : "Try a different search term or clear filters.";

  if (peopleQuery.isLoading) {
    return <LoadingState layout="list" />;
  }

  if (peopleQuery.isError) {
    return (
      <div className="space-y-4">
        {module === "members" ? <ChurchNav /> : null}
        <PageHeader breadcrumbs={[{ label: copy.title, href: basePath }]} title={copy.title} description={copy.listDescription} />
        <DataErrorState onRetry={() => peopleQuery.refetch()} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {module === "members" ? <ChurchNav /> : null}
      <PageHeader
        breadcrumbs={[{ label: copy.title, href: basePath }]}
        title={copy.title}
        description={copy.listDescription}
        action={
          <PermissionGate roles={["ORG_ADMIN", "FUNDRAISING_MANAGER", "FINANCE_MANAGER", "STAFF"]}>
            <Button asChild>
              <Link href={peopleNewPath(module)}>{copy.addLabel}</Link>
            </Button>
          </PermissionGate>
        }
      />

      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder={copy.searchPlaceholder}
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
        onExportCsv={() => exportPeople(module, filtered)}
        emptyTitle={emptyTitle}
        emptyDescription={emptyDescription}
      />
    </div>
  );
}
