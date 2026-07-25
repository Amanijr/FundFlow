"use client";

import { useQuery } from "@tanstack/react-query";
import { type ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { useMemo, useState } from "react";

import { AdminNav } from "@/components/admin/admin-nav";
import { formatEnumLabel } from "@/components/finance/finance-status-badge";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable } from "@/components/tables/data-table";
import { FilterBar } from "@/components/tables/filter-bar";
import { ErrorAlert } from "@/components/feedback/error-alert";
import { LoadingState } from "@/components/feedback/loading-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { listUsers } from "@/lib/api/users";
import type { UserResponse } from "@/types/api";

export default function AdminUsersPage() {
  const { accessToken } = useAuth();
  const [search, setSearch] = useState("");

  const usersQuery = useQuery({
    queryKey: ["admin", "users"],
    queryFn: async () => (await listUsers(accessToken!)).data,
    enabled: Boolean(accessToken),
  });

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return (usersQuery.data ?? []).filter(
      (user) =>
        `${user.firstName} ${user.lastName}`.toLowerCase().includes(q) ||
        user.email.toLowerCase().includes(q),
    );
  }, [usersQuery.data, search]);

  const columns = useMemo<ColumnDef<UserResponse>[]>(
    () => [
      {
        accessorKey: "name",
        header: "User",
        cell: ({ row }) => (
          <Link href={`/admin/users/${row.original.id}`} className="font-medium text-primary hover:underline">
            {row.original.firstName} {row.original.lastName}
          </Link>
        ),
      },
      { accessorKey: "email", header: "Email" },
      {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => formatEnumLabel(row.original.role),
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

  if (usersQuery.isLoading) return <LoadingState />;

  return (
    <div className="space-y-4">
      <PageHeader title="Administration" description="Manage users and organization settings." />
      <AdminNav />

      <PageHeader
        breadcrumbs={[{ label: "Users" }]}
        title="Users"
        description="Invite team members and manage roles."
        action={
          <Button asChild>
            <Link href="/admin/users/new">Invite user</Link>
          </Button>
        }
      />

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
