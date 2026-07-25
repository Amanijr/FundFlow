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
import { SponsorshipStatusBadge } from "@/components/verticals/vertical-status-badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { listSponsorships } from "@/lib/api/school";
import { formatCurrency, toNumber } from "@/lib/utils/format";
import type { StudentSponsorshipResponse } from "@/types/verticals";

export default function SponsorshipsPage() {
  const { accessToken } = useAuth();
  const [search, setSearch] = useState("");

  const sponsorshipsQuery = useQuery({
    queryKey: ["school", "sponsorships"],
    queryFn: async () => (await listSponsorships(accessToken!)).data,
    enabled: Boolean(accessToken),
  });

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return (sponsorshipsQuery.data ?? []).filter(
      (s) =>
        s.beneficiaryName.toLowerCase().includes(q) ||
        s.donorName.toLowerCase().includes(q) ||
        s.academicYear.toLowerCase().includes(q),
    );
  }, [sponsorshipsQuery.data, search]);

  const columns = useMemo<ColumnDef<StudentSponsorshipResponse>[]>(
    () => [
      {
        accessorKey: "beneficiaryName",
        header: "Student",
        cell: ({ row }) => (
          <Link href={`/school/sponsorships/${row.original.id}`} className="font-medium text-primary hover:underline">
            {row.original.beneficiaryName}
          </Link>
        ),
      },
      { accessorKey: "donorName", header: "Donor" },
      { accessorKey: "academicYear", header: "Year" },
      { accessorKey: "term", header: "Term", cell: ({ row }) => row.original.term ?? "—" },
      {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ row }) => formatCurrency(toNumber(row.original.amount)),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <SponsorshipStatusBadge status={row.original.status} />,
      },
    ],
    [],
  );

  if (sponsorshipsQuery.isLoading) return <LoadingState />;

  return (
    <div className="space-y-4">
      <PageHeader
        breadcrumbs={[{ label: "School", href: "/school/sponsorships" }, { label: "Sponsorships" }]}
        title="Student sponsorships"
        description="Link donors to student beneficiaries."
        action={
          <PermissionGate roles={["ORG_ADMIN", "PROGRAM_MANAGER", "STAFF"]}>
            <Button asChild>
              <Link href="/school/sponsorships/new">New sponsorship</Link>
            </Button>
          </PermissionGate>
        }
      />
      {sponsorshipsQuery.isError && <ErrorAlert message="Unable to load sponsorships." />}
      <FilterBar searchValue={search} onSearchChange={setSearch} searchPlaceholder="Search sponsorships..." onReset={() => setSearch("")} />
      <DataTable columns={columns} data={filtered} globalFilter={search} />
    </div>
  );
}
