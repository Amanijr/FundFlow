"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { StatusBadge } from "@/components/display/status-badge";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable } from "@/components/tables/data-table";
import { FilterBar } from "@/components/tables/filter-bar";
import { Button } from "@/components/ui/button";
import { type SampleDonor, sampleDonors } from "@/lib/dev/mock-data";

export default function ReferenceListPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const filtered = useMemo(() => {
    return sampleDonors.filter((donor) => {
      const matchesSearch =
        donor.name.toLowerCase().includes(search.toLowerCase()) ||
        donor.email.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "ALL" || donor.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter]);

  const columns = useMemo<ColumnDef<SampleDonor>[]>(
    () => [
      { accessorKey: "name", header: "Donor" },
      { accessorKey: "email", header: "Email" },
      {
        accessorKey: "totalGiven",
        header: "Total given",
        cell: ({ row }) => `$${row.original.totalGiven.toLocaleString()}`,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      { accessorKey: "lastGift", header: "Last gift" },
    ],
    [],
  );

  const chips =
    statusFilter !== "ALL"
      ? [{ id: "status", label: `Status: ${statusFilter.replaceAll("_", " ")}` }]
      : [];

  return (
    <div className="space-y-4">
      <PageHeader
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Reference list" }]}
        title="Donors"
        description="Reference list page using PageHeader → FilterBar → DataTable."
        action={<Button>Add donor</Button>}
      />

      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search donors..."
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
            <option value="PENDING_REVIEW">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="COMPLETED">Completed</option>
          </select>
        }
      />

      <DataTable
        columns={columns}
        data={filtered}
        globalFilter={search}
        enableSelection
        bulkActions={<Button size="sm" variant="outline">Export selected</Button>}
        onExport={() => toast.message("Export triggered")}
      />
    </div>
  );
}
