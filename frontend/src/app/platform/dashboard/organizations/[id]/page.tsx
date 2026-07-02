"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { DetailCard } from "@/components/display/detail-card";
import { ErrorAlert } from "@/components/feedback/error-alert";
import { LoadingState } from "@/components/feedback/loading-state";
import { formatEnumLabel } from "@/components/finance/finance-status-badge";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { getPlatformOrganization, updateOrganizationStatus } from "@/lib/api/platform";
import { usePlatformStore } from "@/stores/platform-store";
import { formatDateTime } from "@/lib/utils/dates";
import { ApiError } from "@/types/api";

export default function PlatformOrganizationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { accessToken } = useAuth();
  const organizationId = Number(params.id);
  const [actionError, setActionError] = useState<string | null>(null);
  const setTenantContext = usePlatformStore((state) => state.setTenantContext);

  const organizationQuery = useQuery({
    queryKey: ["platform", "organizations", organizationId],
    queryFn: async () => (await getPlatformOrganization(accessToken!, organizationId)).data,
    enabled: Boolean(accessToken) && !Number.isNaN(organizationId),
  });

  async function refresh() {
    await queryClient.invalidateQueries({ queryKey: ["platform", "organizations"] });
    await queryClient.invalidateQueries({ queryKey: ["platform", "organizations", organizationId] });
    await queryClient.invalidateQueries({ queryKey: ["platform", "dashboard"] });
  }

  async function toggleStatus() {
    if (!organizationQuery.data) return;
    setActionError(null);
    try {
      await updateOrganizationStatus(accessToken!, organizationId, {
        active: !organizationQuery.data.active,
      });
      toast.success(organizationQuery.data.active ? "Organization deactivated" : "Organization activated");
      await refresh();
      await organizationQuery.refetch();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Unable to update organization status");
    }
  }

  function openWorkspace() {
    if (!organizationQuery.data) return;
    setTenantContext(organizationQuery.data.id, organizationQuery.data.name);
    router.push("/dashboard/executive");
  }

  if (organizationQuery.isLoading) return <LoadingState />;
  if (organizationQuery.isError || !organizationQuery.data) {
    return <ErrorAlert message="Unable to load organization." />;
  }

  const organization = organizationQuery.data;

  return (
    <div className="space-y-4">
      <PageHeader
        breadcrumbs={[
          { label: "Organizations", href: "/platform/dashboard/organizations" },
          { label: organization.name },
        ]}
        title={organization.name}
        description={`Slug ${organization.slug}`}
        action={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={openWorkspace}>
              Open workspace
            </Button>
            <Button variant={organization.active ? "outline" : "default"} onClick={toggleStatus}>
              {organization.active ? "Deactivate" : "Activate"}
            </Button>
          </div>
        }
      />

      {actionError && <ErrorAlert message={actionError} />}

      <div className="flex gap-2">
        <Badge variant={organization.active ? "success" : "secondary"}>
          {organization.active ? "Active" : "Inactive"}
        </Badge>
        <Badge variant="outline">{formatEnumLabel(organization.type)}</Badge>
      </div>

      <DetailCard
        title="Organization profile"
        fields={[
          { label: "Email", value: organization.email ?? "—" },
          { label: "Phone", value: organization.phone ?? "—" },
          { label: "Address", value: organization.address ?? "—" },
          {
            label: "Location",
            value: [organization.city, organization.state, organization.country].filter(Boolean).join(", ") || "—",
          },
          { label: "Created", value: formatDateTime(organization.createdAt) },
        ]}
      />
    </div>
  );
}
