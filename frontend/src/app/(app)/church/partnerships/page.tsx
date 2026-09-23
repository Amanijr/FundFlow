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
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { listPartnerships } from "@/lib/api/church";
import { formatCurrency } from "@/lib/utils/format";
import type { PartnershipMonthStatus, PartnershipResponse } from "@/types/verticals";

function monthBadge(status: PartnershipMonthStatus) {
  if (status === "PAID") return <Badge variant="success">Paid</Badge>;
  if (status === "AHEAD") return <Badge variant="success">Ahead</Badge>;
  if (status === "PARTIAL") return <Badge variant="secondary">Partial</Badge>;
  if (status === "MISSING") return <Badge variant="danger">Missing</Badge>;
  return <Badge variant="secondary">—</Badge>;
}

export default function PartnershipsPage() {
  const { accessToken } = useAuth();
  const [search, setSearch] = useState("");

  const partnershipsQuery = useQuery({
    queryKey: ["church", "partnerships"],
    queryFn: async () => (await listPartnerships(accessToken!)).data,
    enabled: Boolean(accessToken),
  });

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return (partnershipsQuery.data ?? []).filter(
      (row) =>
        row.memberName.toLowerCase().includes(q) ||
        (row.memberNumber ?? "").toLowerCase().includes(q) ||
        (row.fundName ?? "").toLowerCase().includes(q),
    );
  }, [partnershipsQuery.data, search]);

  const columns = useMemo<ColumnDef<PartnershipResponse>[]>(
    () => [
      {
        accessorKey: "memberName",
        header: "Member",
        cell: ({ row }) => (
          <Link href={`/church/partnerships/${row.original.id}`} className="font-medium text-primary hover:underline">
            {row.original.memberName}
          </Link>
        ),
      },
      {
        accessorKey: "memberNumber",
        header: "Number",
        cell: ({ row }) => row.original.memberNumber ?? "—",
      },
      {
        accessorKey: "monthlyAmount",
        header: "Monthly",
        cell: ({ row }) => formatCurrency(row.original.monthlyAmount),
      },
      {
        id: "thisMonth",
        header: "This month",
        cell: ({ row }) =>
          `${formatCurrency(row.original.thisMonthReceived)} / ${formatCurrency(row.original.thisMonthExpected)}`,
      },
      {
        accessorKey: "thisMonthStatus",
        header: "Progress",
        cell: ({ row }) => monthBadge(row.original.thisMonthStatus),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <Badge variant={row.original.status === "ACTIVE" ? "success" : "secondary"}>{row.original.status}</Badge>,
      },
    ],
    [],
  );

  if (partnershipsQuery.isLoading) return <LoadingState />;

  return (
    <div className="space-y-4">
      <ChurchNav />
      <PageHeader
        breadcrumbs={[{ label: "Church", href: "/church" }, { label: "Partnerships" }]}
        title="Partnerships"
        description="Monthly amounts members promised. Gifts recorded against a partnership fill that month."
        action={
          <PermissionGate roles={["ORG_ADMIN", "STAFF", "FUNDRAISING_MANAGER"]}>
            <Button asChild>
              <Link href="/church/partnerships/new">Add partnership</Link>
            </Button>
          </PermissionGate>
        }
      />
      {partnershipsQuery.isError && <ErrorAlert message="Unable to load partnerships." />}
      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search members..."
        onReset={() => setSearch("")}
      />
      <DataTable columns={columns} data={filtered} globalFilter={search} />
    </div>
  );
}
