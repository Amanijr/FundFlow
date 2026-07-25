"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { type ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { type FormEvent, useMemo, useState } from "react";
import { toast } from "sonner";

import { ErrorAlert } from "@/components/feedback/error-alert";
import { LoadingState } from "@/components/feedback/loading-state";
import { formatEnumLabel } from "@/components/finance/finance-status-badge";
import { PageHeader } from "@/components/layout/page-header";
import { SectionHeader } from "@/components/layout/section-header";
import { DataTable } from "@/components/tables/data-table";
import { FilterBar } from "@/components/tables/filter-bar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { createPlatformOrganization, listPlatformOrganizations } from "@/lib/api/platform";
import { formatDateTime } from "@/lib/utils/dates";
import { ApiError, type OrganizationType } from "@/types/api";
import type { PlatformOrganization } from "@/types/platform";

const organizationTypes: OrganizationType[] = [
  "CHURCH",
  "NGO",
  "FOUNDATION",
  "CHARITY",
  "COMMUNITY_ORGANIZATION",
  "SCHOOL",
  "RELIGIOUS_INSTITUTION",
];

export default function PlatformOrganizationsPage() {
  const queryClient = useQueryClient();
  const { accessToken } = useAuth();
  const [search, setSearch] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const organizationsQuery = useQuery({
    queryKey: ["platform", "organizations"],
    queryFn: async () => (await listPlatformOrganizations(accessToken!)).data,
    enabled: Boolean(accessToken),
  });

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return (organizationsQuery.data ?? []).filter(
      (org) => org.name.toLowerCase().includes(q) || org.slug.toLowerCase().includes(q),
    );
  }, [organizationsQuery.data, search]);

  const columns = useMemo<ColumnDef<PlatformOrganization>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Organization",
        cell: ({ row }) => (
          <Link
            href={`/platform/dashboard/organizations/${row.original.id}`}
            className="font-medium text-primary hover:underline"
          >
            {row.original.name}
          </Link>
        ),
      },
      { accessorKey: "slug", header: "Slug" },
      {
        accessorKey: "type",
        header: "Type",
        cell: ({ row }) => formatEnumLabel(row.original.type),
      },
      { accessorKey: "email", header: "Email", cell: ({ row }) => row.original.email ?? "—" },
      {
        accessorKey: "active",
        header: "Status",
        cell: ({ row }) => (
          <Badge variant={row.original.active ? "success" : "secondary"}>
            {row.original.active ? "Active" : "Inactive"}
          </Badge>
        ),
      },
      {
        accessorKey: "createdAt",
        header: "Created",
        cell: ({ row }) => formatDateTime(row.original.createdAt),
      },
    ],
    [],
  );

  async function handleCreateOrganization(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!accessToken) return;

    const form = new FormData(event.currentTarget);
    setCreateError(null);
    try {
      await createPlatformOrganization(accessToken, {
        name: String(form.get("name") ?? ""),
        slug: String(form.get("slug") ?? "") || undefined,
        type: String(form.get("type") ?? "NGO") as OrganizationType,
        email: String(form.get("email") ?? "") || undefined,
        phone: String(form.get("phone") ?? "") || undefined,
        address: String(form.get("address") ?? "") || undefined,
        city: String(form.get("city") ?? "") || undefined,
        state: String(form.get("state") ?? "") || undefined,
        country: String(form.get("country") ?? "") || undefined,
      });
      toast.success("Organization created");
      event.currentTarget.reset();
      setShowCreateForm(false);
      await queryClient.invalidateQueries({ queryKey: ["platform", "organizations"] });
      await queryClient.invalidateQueries({ queryKey: ["platform", "dashboard"] });
    } catch (err) {
      setCreateError(err instanceof ApiError ? err.message : "Unable to create organization");
    }
  }

  if (organizationsQuery.isLoading) return <LoadingState />;

  return (
    <div className="space-y-4">
      <PageHeader
        breadcrumbs={[{ label: "Organizations" }]}
        title="Organizations"
        description="All tenants registered on the platform."
        action={
          <Button variant={showCreateForm ? "outline" : "default"} onClick={() => setShowCreateForm((value) => !value)}>
            {showCreateForm ? "Hide form" : "Create organization"}
          </Button>
        }
      />
      {showCreateForm && (
        <form onSubmit={handleCreateOrganization} className="space-y-3 rounded-md border border-border bg-surface p-4">
          <SectionHeader
            title="Create tenant"
            description="Manually provision a new organization under the platform."
          />
          {createError && <ErrorAlert message={createError} />}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Input name="name" placeholder="Organization name" required />
            <Input name="slug" placeholder="Slug (optional)" />
            <select name="type" className="h-9 rounded-md border border-input bg-surface px-3 text-sm" defaultValue="NGO">
              {organizationTypes.map((type) => (
                <option key={type} value={type}>
                  {formatEnumLabel(type)}
                </option>
              ))}
            </select>
            <Input name="email" type="email" placeholder="Email" />
            <Input name="phone" placeholder="Phone" />
            <Input name="address" placeholder="Address" />
            <Input name="city" placeholder="City" />
            <Input name="state" placeholder="State" />
            <Input name="country" placeholder="Country" />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
              Cancel
            </Button>
            <Button type="submit">Create tenant</Button>
          </div>
        </form>
      )}
      {organizationsQuery.isError && <ErrorAlert message="Unable to load organizations." />}
      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search organizations..."
        onReset={() => setSearch("")}
      />
      <DataTable columns={columns} data={filtered} globalFilter={search} />
    </div>
  );
}
