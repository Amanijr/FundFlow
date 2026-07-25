"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { AdminNav } from "@/components/admin/admin-nav";
import { InviteUserForm } from "@/components/admin/invite-user-form";
import { PageHeader } from "@/components/layout/page-header";
import { useAuth } from "@/hooks/use-auth";
import { inviteUser } from "@/lib/api/users";
import type { CreateUserRequest } from "@/lib/api/users";
import { ApiError } from "@/types/api";

export default function InviteUserPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { accessToken } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);

  async function handleSubmit(values: CreateUserRequest) {
    setServerError(null);
    try {
      const response = await inviteUser(accessToken!, values);
      toast.success("User invited");
      await queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      router.push(`/admin/users/${response.data.id}`);
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : "Unable to invite user");
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader title="Administration" description="Manage users and organization settings." />
      <AdminNav />

      <PageHeader
        breadcrumbs={[{ label: "Users", href: "/admin/users" }, { label: "Invite user" }]}
        title="Invite user"
      />

      <InviteUserForm
        serverError={serverError}
        onSubmit={handleSubmit}
        onCancel={() => router.push("/admin/users")}
      />
    </div>
  );
}
