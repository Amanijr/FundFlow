"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { AdminNav } from "@/components/admin/admin-nav";
import { DetailCard } from "@/components/display/detail-card";
import { ErrorAlert } from "@/components/feedback/error-alert";
import { LoadingState } from "@/components/feedback/loading-state";
import { formatEnumLabel } from "@/components/finance/finance-status-badge";
import { PageHeader } from "@/components/layout/page-header";
import { SectionHeader } from "@/components/layout/section-header";
import { AuditTrail } from "@/components/workflow/audit-trail";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { getUser, updateUserRole } from "@/lib/api/users";
import { INVITABLE_ROLES } from "@/types/admin";
import { ApiError, type Role } from "@/types/api";
import type { AuditRecord } from "@/types/workflow";

export default function AdminUserDetailPage() {
  const params = useParams();
  const queryClient = useQueryClient();
  const { accessToken, user: currentUser } = useAuth();
  const userId = Number(params.id);
  const [selectedRole, setSelectedRole] = useState<Role | "">("");
  const [saving, setSaving] = useState(false);

  const userQuery = useQuery({
    queryKey: ["admin", "users", userId],
    queryFn: async () => (await getUser(accessToken!, userId)).data,
    enabled: Boolean(accessToken) && !Number.isNaN(userId),
  });

  const roleOptions = useMemo(() => {
    const user = userQuery.data;
    if (!user) return INVITABLE_ROLES;
    if (user.role === "ORG_ADMIN") {
      return ["ORG_ADMIN" as const, ...INVITABLE_ROLES];
    }
    return INVITABLE_ROLES;
  }, [userQuery.data]);

  const auditRecords = useMemo<AuditRecord[]>(() => {
    const user = userQuery.data;
    if (!user) return [];
    return [
      {
        id: "created",
        user: "System",
        action: "User invited",
        timestamp: new Date().toISOString(),
        details: `Role: ${formatEnumLabel(user.role)}`,
      },
    ];
  }, [userQuery.data]);

  async function handleRoleUpdate() {
    if (!selectedRole || !userQuery.data) return;
    setSaving(true);
    try {
      await updateUserRole(accessToken!, userId, { role: selectedRole });
      toast.success("Role updated");
      await queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      await queryClient.invalidateQueries({ queryKey: ["admin", "users", userId] });
      setSelectedRole("");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Unable to update role");
    } finally {
      setSaving(false);
    }
  }

  if (userQuery.isLoading) return <LoadingState />;
  if (userQuery.isError || !userQuery.data) return <ErrorAlert message="Unable to load user." />;

  const user = userQuery.data;
  const isSelf = currentUser?.id === user.id;

  return (
    <div className="space-y-4">
      <PageHeader title="Administration" description="Manage users and organization settings." />
      <AdminNav />

      <PageHeader
        breadcrumbs={[
          { label: "Users", href: "/admin/users" },
          { label: `${user.firstName} ${user.lastName}` },
        ]}
        title={`${user.firstName} ${user.lastName}`}
        description={user.email}
      />

      <Badge variant={user.enabled ? "success" : "secondary"}>
        {user.enabled ? "Active" : "Disabled"}
      </Badge>

      <DetailCard
        title="Account"
        fields={[
          { label: "Email", value: user.email },
          { label: "Role", value: formatEnumLabel(user.role) },
          { label: "User ID", value: String(user.id) },
        ]}
      />

      {!isSelf && (
        <section className="space-y-4 rounded-lg border border-border p-4">
          <SectionHeader title="Change role" description="Assign a new role for this user" />
          <div className="flex flex-wrap items-end gap-3">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">New role</p>
              <select
                className="h-10 min-w-[200px] rounded-md border border-input bg-surface px-3 text-sm"
                value={selectedRole || user.role}
                onChange={(e) => setSelectedRole(e.target.value as Role)}
              >
                {roleOptions.map((role) => (
                  <option key={role} value={role}>
                    {formatEnumLabel(role)}
                  </option>
                ))}
              </select>
            </div>
            <Button
              disabled={saving || !selectedRole || selectedRole === user.role}
              onClick={handleRoleUpdate}
            >
              Update role
            </Button>
          </div>
        </section>
      )}

      {isSelf && (
        <p className="text-sm text-muted-foreground">You cannot change your own role.</p>
      )}

      <section className="space-y-4">
        <SectionHeader title="Audit trail" />
        <AuditTrail records={auditRecords} />
      </section>
    </div>
  );
}
