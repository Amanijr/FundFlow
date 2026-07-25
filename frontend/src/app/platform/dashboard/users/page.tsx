"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { type ColumnDef } from "@tanstack/react-table";
import { type FormEvent, useCallback, useMemo, useState } from "react";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import {
  createPlatformUser,
  createSuperAdmin,
  listPlatformOrganizations,
  listPlatformUsers,
  updatePlatformUserRole,
  updatePlatformUserStatus,
} from "@/lib/api/platform";
import { ApiError, type Role } from "@/types/api";
import type { CreateSuperAdminRequest, PlatformCreateUserRequest, PlatformUser } from "@/types/platform";

const tenantRoles: Exclude<Role, "SUPER_ADMIN">[] = [
  "ORG_ADMIN",
  "FINANCE_MANAGER",
  "ACCOUNTANT",
  "FUNDRAISING_MANAGER",
  "PROGRAM_MANAGER",
  "STAFF",
  "VOLUNTEER",
  "AUDITOR",
  "DONOR",
  "VIEW_ONLY",
];

export default function PlatformUsersPage() {
  const queryClient = useQueryClient();
  const { accessToken } = useAuth();
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showUserForm, setShowUserForm] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [userCreateError, setUserCreateError] = useState<string | null>(null);

  const usersQuery = useQuery({
    queryKey: ["platform", "users"],
    queryFn: async () => (await listPlatformUsers(accessToken!)).data,
    enabled: Boolean(accessToken),
  });

  const organizationsQuery = useQuery({
    queryKey: ["platform", "organizations"],
    queryFn: async () => (await listPlatformOrganizations(accessToken!)).data,
    enabled: Boolean(accessToken),
  });

  const refreshPlatformUsers = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ["platform", "users"] });
    await queryClient.invalidateQueries({ queryKey: ["platform", "dashboard"] });
  }, [queryClient]);

  const handleUserStatus = useCallback(async (user: PlatformUser) => {
    if (!accessToken) return;
    try {
      await updatePlatformUserStatus(accessToken, user.id, { enabled: !user.enabled });
      toast.success(user.enabled ? "User suspended" : "User reactivated");
      await refreshPlatformUsers();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Unable to update user status");
    }
  }, [accessToken, refreshPlatformUsers]);

  const handleUserRole = useCallback(async (user: PlatformUser, role: Exclude<Role, "SUPER_ADMIN">) => {
    if (!accessToken || user.role === role) return;
    try {
      await updatePlatformUserRole(accessToken, user.id, { role });
      toast.success("User role updated");
      await refreshPlatformUsers();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Unable to update user role");
    }
  }, [accessToken, refreshPlatformUsers]);

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
        cell: ({ row }) =>
          row.original.role === "SUPER_ADMIN" ? (
            formatEnumLabel(row.original.role)
          ) : (
            <select
              className="h-8 rounded-md border border-input bg-surface px-2 text-xs"
              value={row.original.role}
              onChange={(event) =>
                void handleUserRole(row.original, event.target.value as Exclude<Role, "SUPER_ADMIN">)
              }
            >
              {tenantRoles.map((role) => (
                <option key={role} value={role}>
                  {formatEnumLabel(role)}
                </option>
              ))}
            </select>
          ),
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
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <Button
            type="button"
            size="sm"
            variant={row.original.enabled ? "outline" : "default"}
            onClick={() => void handleUserStatus(row.original)}
          >
            {row.original.enabled ? "Suspend" : "Reactivate"}
          </Button>
        ),
      },
    ],
    [handleUserRole, handleUserStatus],
  );

  async function handleCreateSuperAdmin(values: CreateSuperAdminRequest) {
    setServerError(null);
    try {
      await createSuperAdmin(accessToken!, values);
      toast.success("Super administrator created");
      setShowForm(false);
      await refreshPlatformUsers();
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : "Unable to create super administrator");
    }
  }

  async function handleCreateTenantUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!accessToken) return;

    const form = new FormData(event.currentTarget);
    const request: PlatformCreateUserRequest = {
      organizationId: Number(form.get("organizationId")),
      email: String(form.get("email") ?? ""),
      password: String(form.get("password") ?? ""),
      firstName: String(form.get("firstName") ?? ""),
      lastName: String(form.get("lastName") ?? ""),
      role: String(form.get("role") ?? "STAFF") as Exclude<Role, "SUPER_ADMIN">,
    };

    setUserCreateError(null);
    try {
      await createPlatformUser(accessToken, request);
      toast.success("Tenant user created");
      event.currentTarget.reset();
      setShowUserForm(false);
      await refreshPlatformUsers();
    } catch (err) {
      setUserCreateError(err instanceof ApiError ? err.message : "Unable to create tenant user");
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

      <section className="space-y-4">
        <SectionHeader
          title="Tenant users"
          description="Create users in any organization and manage access instantly"
          action={
            <button
              type="button"
              className="text-sm text-primary hover:underline"
              onClick={() => setShowUserForm((value) => !value)}
            >
              {showUserForm ? "Hide form" : "Add tenant user"}
            </button>
          }
        />
        {showUserForm && (
          <form onSubmit={handleCreateTenantUser} className="space-y-3 rounded-md border border-border bg-surface p-4">
            {userCreateError && <ErrorAlert message={userCreateError} />}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <select
                name="organizationId"
                className="h-9 rounded-md border border-input bg-surface px-3 text-sm"
                required
              >
                <option value="">Select organization</option>
                {(organizationsQuery.data ?? []).map((organization) => (
                  <option key={organization.id} value={organization.id}>
                    {organization.name}
                  </option>
                ))}
              </select>
              <Input name="email" type="email" placeholder="Email" required />
              <Input name="password" type="password" placeholder="Temporary password" minLength={8} required />
              <Input name="firstName" placeholder="First name" required />
              <Input name="lastName" placeholder="Last name" required />
              <select name="role" className="h-9 rounded-md border border-input bg-surface px-3 text-sm" defaultValue="STAFF">
                {tenantRoles.map((role) => (
                  <option key={role} value={role}>
                    {formatEnumLabel(role)}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowUserForm(false)}>
                Cancel
              </Button>
              <Button type="submit">Create tenant user</Button>
            </div>
          </form>
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
