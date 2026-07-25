"use client";

import { useQuery } from "@tanstack/react-query";
import { type ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { useMemo, useState } from "react";

import { CampaignStatusBadge } from "@/components/fundraising/fundraising-status-badge";
import { PageHeader } from "@/components/layout/page-header";
import { PermissionGate } from "@/components/security/permission-gate";
import { DataTable } from "@/components/tables/data-table";
import { FilterBar } from "@/components/tables/filter-bar";
import { ErrorAlert } from "@/components/feedback/error-alert";
import { LoadingState } from "@/components/feedback/loading-state";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { listCampaigns } from "@/lib/api/campaigns";
import { formatCurrency, toNumber } from "@/lib/utils/format";
import { formatDate } from "@/lib/utils/dates";
import type { CampaignResponse } from "@/types/fundraising";

export default function CampaignsPage() {
  const { accessToken } = useAuth();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const campaignsQuery = useQuery({
    queryKey: ["campaigns"],
    queryFn: async () => {
      const response = await listCampaigns(accessToken!);
      return response.data;
    },
    enabled: Boolean(accessToken),
  });

  const filtered = useMemo(() => {
    return (campaignsQuery.data ?? []).filter((campaign) => {
      const matchesSearch = campaign.name.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "ALL" || campaign.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [campaignsQuery.data, search, statusFilter]);

  const columns = useMemo<ColumnDef<CampaignResponse>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Campaign",
        cell: ({ row }) => (
          <Link href={`/campaigns/${row.original.id}`} className="font-medium text-primary hover:underline">
            {row.original.name}
          </Link>
        ),
      },
      {
        accessorKey: "targetAmount",
        header: "Goal",
        cell: ({ row }) =>
          row.original.targetAmount != null ? formatCurrency(toNumber(row.original.targetAmount)) : "—",
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <CampaignStatusBadge status={row.original.status} />,
      },
      {
        accessorKey: "startDate",
        header: "Start",
        cell: ({ row }) => formatDate(row.original.startDate),
      },
      {
        accessorKey: "endDate",
        header: "End",
        cell: ({ row }) => formatDate(row.original.endDate),
      },
    ],
    [],
  );

  const chips =
    statusFilter !== "ALL"
      ? [{ id: "status", label: `Status: ${statusFilter.replaceAll("_", " ")}` }]
      : [];

  if (campaignsQuery.isLoading) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-4">
      <PageHeader
        breadcrumbs={[{ label: "Campaigns", href: "/campaigns" }]}
        title="Campaigns"
        description="Track fundraising campaigns and progress toward goals."
        action={
          <PermissionGate roles={["ORG_ADMIN", "FUNDRAISING_MANAGER", "STAFF"]}>
            <Button asChild>
              <Link href="/campaigns/new">Create campaign</Link>
            </Button>
          </PermissionGate>
        }
      />

      {campaignsQuery.isError && <ErrorAlert message="Unable to load campaigns." />}

      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search campaigns..."
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
            <option value="DRAFT">Draft</option>
            <option value="ACTIVE">Active</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        }
      />

      <DataTable columns={columns} data={filtered} globalFilter={search} />
    </div>
  );
}
