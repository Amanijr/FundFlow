"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { type ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { ErrorAlert } from "@/components/feedback/error-alert";
import { LoadingState } from "@/components/feedback/loading-state";
import { formatEnumLabel } from "@/components/finance/finance-status-badge";
import { PageHeader } from "@/components/layout/page-header";
import { SectionHeader } from "@/components/layout/section-header";
import { SuperAdminForm } from "@/components/platform/super-admin-form";
import { DataTable } from "@/components/tables/data-table";
import { FilterBar } from "@/components/tables/filter-bar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { createSuperAdmin, listPlatformUsers } from "@/lib/api/platform";
import { ApiError } from "@/types/api";
import type { CreateSuperAdminRequest, PlatformUser } from "@/types/platform";

export default function PlatformUsersPage() {
  const queryClient = useQueryClient();
  const { accessToken } = useAuth();
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const usersQuery = useQuery({
    queryKey: ["platform", "users"],
    queryFn: async () => (await listPlatformUsers(accessToken!)).data,
    enabled: Boolean(accessToken),
  });

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return (usersQuery.data ?? []).filter(
      (user) =>
        `${user.firstName} ${user.lastName}`.toLowerCase().includes(q) ||
        user.email.toLowerCase().includes(q) ||
        (user.organizationName ?? "").toLowerCase().includes(q),
    );
  }, [usersQuery.data, search]);

  const columns = useMemo<ColumnDef<PlatformUser>[]>(
    () => [
      {
        accessorKey: "name",
        header: "User",
        cell: ({ row }) => `${row.original.firstName} ${row.original.lastName}`,
      },
      { accessorKey: "email", header: "Email" },
      {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => formatEnumLabel(row.original.role),
      },
      {
        accessorKey: "organizationName",
        header: "Organization",
        cell: ({ row }) => row.original.organizationName ?? "Platform",
      },
      {
        accessorKey: "enabled",
        header: "Status",
        cell: ({ row }) => (
          <Badge variant={row.original.enabled ? "success" : "secondary"}>
            {row.original.enabled ? "Active" : "Disabled"}
          </Badge>
        ),
      },
    ],
    [],
  );

  async function handleCreateSuperAdmin(values: CreateSuperAdminRequest) {
    setServerError(null);
    try {
      await createSuperAdmin(accessToken!, values);
      toast.success("Super administrator created");
      setShowForm(false);
      await queryClient.invalidateQueries({ queryKey: ["platform", "users"] });
      await queryClient.invalidateQueries({ queryKey: ["platform", "dashboard"] });
      await usersQuery.refetch();
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : "Unable to create super administrator");
    }
  }

  if (usersQuery.isLoading) return <LoadingState />;

  return (
    <div className="space-y-4">
      <PageHeader
        breadcrumbs={[{ label: "Users" }]}
        title="Platform users"
        description="Cross-tenant user directory and super-admin management."
      />

      <section className="space-y-4">
        <SectionHeader
          title="Super administrators"
          description="Create additional platform owner accounts"
          action={
            <button
              type="button"
              className="text-sm text-primary hover:underline"
              onClick={() => setShowForm((value) => !value)}
            >
              {showForm ? "Hide form" : "Add super admin"}
            </button>
          }
        />
        {showForm && (
          <SuperAdminForm
            submitLabel="Create super admin"
            serverError={serverError}
            onSubmit={handleCreateSuperAdmin}
            onCancel={() => setShowForm(false)}
          />
        )}
      </section>

      {usersQuery.isError && <ErrorAlert message="Unable to load users." />}
      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search users..."
        onReset={() => setSearch("")}
      />
      <DataTable columns={columns} data={filtered} globalFilter={search} />
    </div>
  );
}
