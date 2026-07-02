"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { DetailCard } from "@/components/display/detail-card";
import { ErrorAlert } from "@/components/feedback/error-alert";
import { LoadingState } from "@/components/feedback/loading-state";
import { PageHeader } from "@/components/layout/page-header";
import { LogSeverityBadge, LogTypeBadge } from "@/components/platform/log-status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { getPlatformLog, resolvePlatformAlert } from "@/lib/api/platform";
import { formatDateTime } from "@/lib/utils/dates";
import { ApiError } from "@/types/api";

export default function PlatformLogDetailPage() {
  const params = useParams();
  const queryClient = useQueryClient();
  const { accessToken } = useAuth();
  const logId = Number(params.id);
  const [actionError, setActionError] = useState<string | null>(null);

  const logQuery = useQuery({
    queryKey: ["platform", "logs", logId],
    queryFn: async () => (await getPlatformLog(accessToken!, logId)).data,
    enabled: Boolean(accessToken) && !Number.isNaN(logId),
  });

  async function handleResolve() {
    setActionError(null);
    try {
      await resolvePlatformAlert(accessToken!, logId);
      toast.success("Alert resolved");
      await logQuery.refetch();
      await queryClient.invalidateQueries({ queryKey: ["platform", "logs"] });
      await queryClient.invalidateQueries({ queryKey: ["platform", "dashboard"] });
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Unable to resolve alert");
    }
  }

  if (logQuery.isLoading) return <LoadingState />;
  if (logQuery.isError || !logQuery.data) return <ErrorAlert message="Unable to load log entry." />;

  const log = logQuery.data;
  const canResolve = log.logType === "ALERT" && !log.alertResolved;

  return (
    <div className="space-y-4">
      <PageHeader
        breadcrumbs={[
          { label: "System logs", href: "/platform/dashboard/logs" },
          { label: `Log #${log.id}` },
        ]}
        title={log.message}
        description={`${log.category} · ${formatDateTime(log.createdAt)}`}
        action={
          canResolve ? (
            <Button onClick={handleResolve}>Resolve alert</Button>
          ) : undefined
        }
      />

      {actionError && <ErrorAlert message={actionError} />}

      <div className="flex flex-wrap gap-2">
        <LogTypeBadge type={log.logType} />
        <LogSeverityBadge severity={log.severity} />
        {log.logType === "ALERT" && (
          <Badge variant={log.alertResolved ? "success" : "warning"}>
            {log.alertResolved ? "Resolved" : "Unresolved"}
          </Badge>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <DetailCard
          title="Event details"
          fields={[
            { label: "Details", value: log.details ?? "—" },
            { label: "User email", value: log.userEmail ?? "—" },
            { label: "User ID", value: log.userId != null ? String(log.userId) : "—" },
            {
              label: "Organization",
              value:
                log.organizationId != null ? (
                  <Link
                    href={`/platform/dashboard/organizations/${log.organizationId}`}
                    className="text-primary hover:underline"
                  >
                    Org #{log.organizationId}
                  </Link>
                ) : (
                  "—"
                ),
            },
          ]}
        />
        <DetailCard
          title="Request context"
          fields={[
            { label: "Method", value: log.requestMethod ?? "—" },
            { label: "Path", value: log.requestPath ?? "—" },
            { label: "HTTP status", value: log.httpStatus != null ? String(log.httpStatus) : "—" },
            { label: "Exception", value: log.exceptionType ?? "—" },
          ]}
        />
      </div>
    </div>
  );
}
