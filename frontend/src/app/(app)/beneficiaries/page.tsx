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
import { BeneficiaryStatusBadge } from "@/components/verticals/vertical-status-badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { listBeneficiaries } from "@/lib/api/beneficiaries";
import { formatDate } from "@/lib/utils/dates";
import type { BeneficiaryResponse } from "@/types/verticals";

export default function BeneficiariesPage() {
  const { accessToken } = useAuth();
  const [search, setSearch] = useState("");

  const beneficiariesQuery = useQuery({
    queryKey: ["beneficiaries"],
    queryFn: async () => (await listBeneficiaries(accessToken!)).data,
    enabled: Boolean(accessToken),
  });

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return (beneficiariesQuery.data ?? []).filter(
      (b) =>
        b.firstName.toLowerCase().includes(q) ||
        b.lastName.toLowerCase().includes(q) ||
        b.code.toLowerCase().includes(q),
    );
  }, [beneficiariesQuery.data, search]);

  const columns = useMemo<ColumnDef<BeneficiaryResponse>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => (
          <Link href={`/beneficiaries/${row.original.id}`} className="font-medium text-primary hover:underline">
            {row.original.firstName} {row.original.lastName}
          </Link>
        ),
      },
      { accessorKey: "code", header: "Code" },
      {
        accessorKey: "beneficiaryType",
        header: "Type",
        cell: ({ row }) => formatEnumLabel(row.original.beneficiaryType),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <BeneficiaryStatusBadge status={row.original.status} />,
      },
      {
        accessorKey: "enrollmentDate",
        header: "Enrolled",
        cell: ({ row }) => (row.original.enrollmentDate ? formatDate(row.original.enrollmentDate) : "—"),
      },
    ],
    [],
  );

  if (beneficiariesQuery.isLoading) return <LoadingState />;

  return (
    <div className="space-y-4">
      <PageHeader
        breadcrumbs={[{ label: "Beneficiaries", href: "/beneficiaries" }]}
        title="Beneficiaries"
        description="People served by your programs."
        action={
          <PermissionGate roles={["ORG_ADMIN", "PROGRAM_MANAGER", "STAFF"]}>
            <Button asChild>
              <Link href="/beneficiaries/new">Add beneficiary</Link>
            </Button>
          </PermissionGate>
        }
      />
      {beneficiariesQuery.isError && <ErrorAlert message="Unable to load beneficiaries." />}
      <FilterBar searchValue={search} onSearchChange={setSearch} searchPlaceholder="Search beneficiaries..." onReset={() => setSearch("")} />
      <DataTable columns={columns} data={filtered} globalFilter={search} />
    </div>
  );
}
