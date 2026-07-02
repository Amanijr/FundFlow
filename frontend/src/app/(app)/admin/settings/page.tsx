"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { AdminNav } from "@/components/admin/admin-nav";
import { OrganizationSettingsForm } from "@/components/admin/organization-settings-form";
import { ErrorAlert } from "@/components/feedback/error-alert";
import { LoadingState } from "@/components/feedback/loading-state";
import { PageHeader } from "@/components/layout/page-header";
import { useAuth } from "@/hooks/use-auth";
import { getCurrentOrganization, updateCurrentOrganization } from "@/lib/api/organization";
import { ApiError } from "@/types/api";
import type { OrganizationUpdateRequest } from "@/types/admin";

export default function AdminSettingsPage() {
  const queryClient = useQueryClient();
  const { accessToken } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);

  const orgQuery = useQuery({
    queryKey: ["organization", "me"],
    queryFn: async () => (await getCurrentOrganization(accessToken!)).data,
    enabled: Boolean(accessToken),
  });

  async function handleSubmit(values: OrganizationUpdateRequest) {
    setServerError(null);
    try {
      await updateCurrentOrganization(accessToken!, values);
      toast.success("Organization updated");
      await queryClient.invalidateQueries({ queryKey: ["organization", "me"] });
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : "Unable to update organization");
    }
  }

  if (orgQuery.isLoading) return <LoadingState />;
  if (orgQuery.isError || !orgQuery.data) return <ErrorAlert message="Unable to load organization." />;

  const org = orgQuery.data;

  return (
    <div className="space-y-4">
      <PageHeader title="Administration" description="Manage users and organization settings." />
      <AdminNav />

      <PageHeader
        breadcrumbs={[{ label: "Organization settings" }]}
        title="Organization settings"
        description={`Slug: ${org.slug}`}
      />

      <OrganizationSettingsForm
        serverError={serverError}
        defaultValues={{
          name: org.name,
          type: org.type,
          email: org.email ?? "",
          phone: org.phone ?? "",
          address: org.address ?? "",
          city: org.city ?? "",
          state: org.state ?? "",
          country: org.country ?? "",
        }}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
