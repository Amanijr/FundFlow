"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { WorkflowDetailView } from "@/components/workflow/workflow-detail-view";
import { AttachmentList } from "@/components/documents/attachment-list";
import { DetailCard } from "@/components/display/detail-card";
import { ErrorAlert } from "@/components/feedback/error-alert";
import { LoadingState } from "@/components/feedback/loading-state";
import { formatEnumLabel } from "@/components/finance/finance-status-badge";
import { PageHeader } from "@/components/layout/page-header";
import { SectionHeader } from "@/components/layout/section-header";
import { PermissionGate } from "@/components/security/permission-gate";
import { GrantStatusBadge } from "@/components/verticals/vertical-status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { activateGrant, closeGrant, getGrant, getGrantUtilization } from "@/lib/api/grants";
import { MetricCard } from "@/components/charts/metric-card";
import { formatCurrency, formatPercent, toNumber } from "@/lib/utils/format";
import { formatDate, formatDateTime } from "@/lib/utils/dates";
import { ApiError } from "@/types/api";

export default function GrantDetailPage() {
  const params = useParams();
  const queryClient = useQueryClient();
  const { accessToken } = useAuth();
  const grantId = Number(params.id);
  const [workflowError, setWorkflowError] = useState<string | null>(null);

  const grantQuery = useQuery({
    queryKey: ["grants", grantId],
    queryFn: async () => (await getGrant(accessToken!, grantId)).data,
    enabled: Boolean(accessToken) && !Number.isNaN(grantId),
  });

  const utilizationQuery = useQuery({
    queryKey: ["grants", grantId, "utilization"],
    queryFn: async () => (await getGrantUtilization(accessToken!, grantId)).data,
    enabled: Boolean(accessToken) && !Number.isNaN(grantId),
  });

  async function refresh() {
    await queryClient.invalidateQueries({ queryKey: ["grants", grantId] });
    await queryClient.invalidateQueries({ queryKey: ["grants", grantId, "utilization"] });
  }

  async function handleWorkflow(action: "activate" | "close") {
    setWorkflowError(null);
    try {
      if (action === "activate") await activateGrant(accessToken!, grantId);
      if (action === "close") await closeGrant(accessToken!, grantId);
      toast.success(action === "activate" ? "Grant activated" : "Grant closed");
      await refresh();
    } catch (err) {
      setWorkflowError(err instanceof ApiError ? err.message : "Unable to update grant status");
    }
  }

  if (grantQuery.isLoading) return <LoadingState />;
  if (grantQuery.isError || !grantQuery.data) return <ErrorAlert message="Unable to load grant." />;

  const grant = grantQuery.data;
  const utilization = utilizationQuery.data;

  return (
    <div className="space-y-4">
      <PageHeader
        breadcrumbs={[{ label: "Grants", href: "/grants" }, { label: grant.name }]}
        title={grant.name}
        description={`${grant.grantCode} · ${grant.funderName}`}
        action={
          <div className="flex gap-2">
            <PermissionGate roles={["ORG_ADMIN", "FINANCE_MANAGER", "PROGRAM_MANAGER"]}>
              <Button variant="outline" asChild>
                <Link href={`/grants/${grant.id}/edit`}>Edit</Link>
              </Button>
            </PermissionGate>
            <PermissionGate roles={["ORG_ADMIN", "FINANCE_MANAGER"]}>
              {grant.status === "DRAFT" && (
                <Button onClick={() => handleWorkflow("activate")}>Activate</Button>
              )}
              {grant.status === "ACTIVE" && (
                <Button variant="outline" onClick={() => handleWorkflow("close")}>
                  Close grant
                </Button>
              )}
            </PermissionGate>
          </div>
        }
      />

      {workflowError && <ErrorAlert message={workflowError} />}

      <div className="flex flex-wrap gap-2">
        <GrantStatusBadge status={grant.status} />
        <Badge variant="outline">{formatEnumLabel(grant.restrictionType)}</Badge>
        {grant.complianceStatus && (
          <Badge variant={grant.complianceStatus === "COMPLIANT" ? "success" : grant.complianceStatus === "AT_RISK" ? "warning" : "secondary"}>
            {formatEnumLabel(grant.complianceStatus)}
          </Badge>
        )}
        {utilization?.expiringSoon && <Badge variant="warning">Expiring soon</Badge>}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <DetailCard
          title="Award details"
          fields={[
            { label: "Awarded amount", value: formatCurrency(toNumber(grant.awardedAmount)) },
            { label: "Start date", value: formatDate(grant.startDate) },
            { label: "End date", value: formatDate(grant.endDate) },
            { label: "Restriction notes", value: grant.restrictionNotes ?? "—" },
            { label: "Compliance notes", value: grant.complianceNotes ?? "—" },
            { label: "Created", value: formatDateTime(grant.createdAt) },
          ]}
        />
        <DetailCard
          title="Links"
          fields={[
            {
              label: "Program",
              value: grant.programId ? (
                <Link href={`/programs/${grant.programId}`} className="text-primary hover:underline">
                  {grant.programName ?? `Program #${grant.programId}`}
                </Link>
              ) : (
                "—"
              ),
            },
            {
              label: "Fund",
              value: grant.fundId ? (
                <Link href={`/funds/${grant.fundId}`} className="text-primary hover:underline">
                  {grant.fundName ?? `Fund #${grant.fundId}`}
                </Link>
              ) : (
                "—"
              ),
            },
          ]}
        />
      </div>

      {utilizationQuery.isError && <ErrorAlert message="Unable to load utilization." />}

      {utilization && (
        <section className="space-y-2">
          <SectionHeader title="Utilization" description="Spend against awarded amount" />
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard label="Spent" value={formatCurrency(toNumber(utilization.spentAmount))} />
            <MetricCard label="Remaining" value={formatCurrency(toNumber(utilization.remainingBalance))} />
            <MetricCard label="Usage" value={formatPercent(toNumber(utilization.usagePercent))} />
            <MetricCard label="Days to expiry" value={String(utilization.daysToExpiry)} />
          </div>
        </section>
      )}

      <section className="space-y-4">
        <SectionHeader title="Approval" description="Workflow status and actions" />
        <WorkflowDetailView entityType="grant" entityId={grantId} />
      </section>

      <section className="space-y-4">
        <SectionHeader title="Attachments" description="Grant agreements and supporting documents" />
        <AttachmentList entityType="grant" entityId={grantId} category="grant_agreement" />
      </section>
    </div>
  );
}
