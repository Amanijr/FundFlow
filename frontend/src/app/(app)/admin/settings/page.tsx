"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { AdminNav } from "@/components/admin/admin-nav";
import { OrganizationSettingsForm } from "@/components/admin/organization-settings-form";
import { ErrorAlert } from "@/components/feedback/error-alert";
import { LoadingState } from "@/components/feedback/loading-state";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/use-auth";
import { getCurrentOrganization, updateCurrentOrganization } from "@/lib/api/organization";
import { useSessionPreferencesStore } from "@/stores/session-preferences-store";
import { ApiError } from "@/types/api";
import type { OrganizationUpdateRequest } from "@/types/admin";

export default function AdminSettingsPage() {
  const queryClient = useQueryClient();
  const { accessToken } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);
  const simpleMode = useSessionPreferencesStore((state) => state.simpleMode);
  const setSimpleMode = useSessionPreferencesStore((state) => state.setSimpleMode);

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

      <Card>
        <CardContent className="flex items-center justify-between gap-4 p-4">
          <div className="space-y-1">
            <Label htmlFor="settings-simple-mode" className="text-sm font-medium">
              Simple mode
            </Label>
            <p className="text-sm text-muted-foreground">
              Keep menus focused on day-to-day work. Users can also change this under Preferences.
            </p>
          </div>
          <Switch
            id="settings-simple-mode"
            checked={simpleMode}
            onCheckedChange={setSimpleMode}
            aria-label="Toggle simple mode"
          />
        </CardContent>
      </Card>

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
