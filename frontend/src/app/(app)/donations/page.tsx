"use client";

import { useQuery } from "@tanstack/react-query";
import { type ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { useMemo, useState } from "react";

import { DonationStatusBadge, formatDonationType } from "@/components/fundraising/fundraising-status-badge";
import { PageHeader } from "@/components/layout/page-header";
import { PermissionGate } from "@/components/security/permission-gate";
import { DataTable } from "@/components/tables/data-table";
import { FilterBar } from "@/components/tables/filter-bar";
import { ErrorAlert } from "@/components/feedback/error-alert";
import { LoadingState } from "@/components/feedback/loading-state";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { listDonations } from "@/lib/api/donations";
import { formatCurrency, toNumber } from "@/lib/utils/format";
import { formatDateTime } from "@/lib/utils/dates";
import type { DonationSummaryResponse } from "@/types/fundraising";

export default function DonationsPage() {
  const { accessToken } = useAuth();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const donationsQuery = useQuery({
    queryKey: ["donations"],
    queryFn: async () => {
      const response = await listDonations(accessToken!);
      return response.data;
    },
    enabled: Boolean(accessToken),
  });

  const filtered = useMemo(() => {
    return (donationsQuery.data ?? []).filter((donation) => {
      const label = `#${donation.id} ${donation.campaignName ?? ""}`.toLowerCase();
      const matchesSearch = label.includes(search.toLowerCase());
      const matchesStatus = statusFilter === "ALL" || donation.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [donationsQuery.data, search, statusFilter]);

  const columns = useMemo<ColumnDef<DonationSummaryResponse>[]>(
    () => [
      {
        accessorKey: "id",
        header: "Donation",
        cell: ({ row }) => (
          <Link href={`/donations/${row.original.id}`} className="font-medium text-primary hover:underline">
            #{row.original.id}
          </Link>
        ),
      },
      {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ row }) => formatCurrency(toNumber(row.original.amount)),
      },
      {
        accessorKey: "donationType",
        header: "Type",
        cell: ({ row }) => formatDonationType(row.original.donationType),
      },
      {
        accessorKey: "campaignName",
        header: "Campaign",
        cell: ({ row }) => row.original.campaignName ?? "—",
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <DonationStatusBadge status={row.original.status} />,
      },
      {
        accessorKey: "donationTime",
        header: "Date",
        cell: ({ row }) => formatDateTime(row.original.donationTime),
      },
    ],
    [],
  );

  const chips =
    statusFilter !== "ALL"
      ? [{ id: "status", label: `Status: ${statusFilter.replaceAll("_", " ")}` }]
      : [];

  if (donationsQuery.isLoading) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-4">
      <PageHeader
        breadcrumbs={[{ label: "Donations", href: "/donations" }]}
        title="Donations"
        description="View and record gifts across campaigns and donors."
        action={
          <PermissionGate roles={["ORG_ADMIN", "FUNDRAISING_MANAGER", "FINANCE_MANAGER", "STAFF"]}>
            <Button asChild>
              <Link href="/donations/new">Record donation</Link>
            </Button>
          </PermissionGate>
        }
      />

      {donationsQuery.isError && <ErrorAlert message="Unable to load donations." />}

      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search donations..."
        activeChips={chips}
        onRemoveChip={() => setStatusFilter("ALL")}
        onReset={() => {
          setSearch("");
          setStatusFilter("ALL");
        }}
        filters={
          <select
            className="h-10 rounded-md border border-input bg-surface px-3 text-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All statuses</option>
            <option value="PENDING">Pending</option>
            <option value="COMPLETED">Completed</option>
            <option value="FAILED">Failed</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="REFUNDED">Refunded</option>
          </select>
        }
      />

      <DataTable columns={columns} data={filtered} globalFilter={search} />
    </div>
  );
}
