"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { MinistryForm } from "@/components/church/ministry-form";
import { DetailCard } from "@/components/display/detail-card";
import { ErrorAlert } from "@/components/feedback/error-alert";
import { LoadingState } from "@/components/feedback/loading-state";
import { PageHeader } from "@/components/layout/page-header";
import { PermissionGate } from "@/components/security/permission-gate";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { getMinistry, updateMinistry } from "@/lib/api/church";
import { formatDateTime } from "@/lib/utils/dates";
import { ApiError } from "@/types/api";
import type { MinistryRequest } from "@/types/verticals";

export default function MinistryDetailPage() {
  const params = useParams();
  const { accessToken } = useAuth();
  const ministryId = Number(params.id);
  const [editing, setEditing] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const ministryQuery = useQuery({
    queryKey: ["church", "ministries", ministryId],
    queryFn: async () => (await getMinistry(accessToken!, ministryId)).data,
    enabled: Boolean(accessToken) && !Number.isNaN(ministryId),
  });

  async function handleSubmit(values: MinistryRequest) {
    setServerError(null);
    try {
      await updateMinistry(accessToken!, ministryId, values);
      toast.success("Ministry updated");
      setEditing(false);
      await ministryQuery.refetch();
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : "Unable to update ministry");
    }
  }

  if (ministryQuery.isLoading) return <LoadingState />;
  if (ministryQuery.isError || !ministryQuery.data) return <ErrorAlert message="Unable to load ministry." />;

  const ministry = ministryQuery.data;

  if (editing) {
    return (
      <div className="space-y-4">
        <PageHeader
          breadcrumbs={[
            { label: "Church", href: "/church/ministries" },
            { label: "Ministries", href: "/church/ministries" },
            { label: ministry.name, href: `/church/ministries/${ministry.id}` },
            { label: "Edit" },
          ]}
          title="Edit ministry"
        />
        <MinistryForm
          submitLabel="Save changes"
          serverError={serverError}
          defaultValues={{
            name: ministry.name,
            code: ministry.code,
            description: ministry.description ?? "",
            leaderName: ministry.leaderName ?? "",
            active: ministry.active,
          }}
          onSubmit={handleSubmit}
          onCancel={() => setEditing(false)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PageHeader
        breadcrumbs={[
          { label: "Church", href: "/church/ministries" },
          { label: "Ministries", href: "/church/ministries" },
          { label: ministry.name },
        ]}
        title={ministry.name}
        description={`Code ${ministry.code}`}
        action={
          <PermissionGate roles={["ORG_ADMIN", "STAFF"]}>
            <Button variant="outline" onClick={() => setEditing(true)}>
              Edit
            </Button>
          </PermissionGate>
        }
      />

      <Badge variant={ministry.active ? "success" : "secondary"}>{ministry.active ? "Active" : "Inactive"}</Badge>

      <DetailCard
        title="Ministry details"
        fields={[
          { label: "Leader", value: ministry.leaderName ?? "—" },
          { label: "Description", value: ministry.description ?? "—" },
          { label: "Created", value: formatDateTime(ministry.createdAt) },
        ]}
      />

      <p className="text-sm text-muted-foreground">
        Record attendance from{" "}
        <Link href="/church/attendance" className="text-primary hover:underline">
          Attendance
        </Link>
        .
      </p>
    </div>
  );
}
