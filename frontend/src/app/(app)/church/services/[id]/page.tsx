"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";
import { toast } from "sonner";

import { ChurchNav } from "@/components/church/church-nav";
import { ServiceForm } from "@/components/church/service-form";
import { DetailCard } from "@/components/display/detail-card";
import { ErrorAlert } from "@/components/feedback/error-alert";
import { LoadingState } from "@/components/feedback/loading-state";
import { PageHeader } from "@/components/layout/page-header";
import { PermissionGate } from "@/components/security/permission-gate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { getService, listMinistries, recordAttendance, updateService } from "@/lib/api/church";
import { formatDate, formatDateTime } from "@/lib/utils/dates";
import { ApiError } from "@/types/api";
import type { ServiceEventRequest } from "@/types/verticals";

export default function ServiceDetailPage() {
  const params = useParams();
  const queryClient = useQueryClient();
  const { accessToken } = useAuth();
  const serviceId = Number(params.id);
  const [editing, setEditing] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [headcount, setHeadcount] = useState("");
  const [notes, setNotes] = useState("");

  const serviceQuery = useQuery({
    queryKey: ["church", "services", serviceId],
    queryFn: async () => (await getService(accessToken!, serviceId)).data,
    enabled: Boolean(accessToken) && !Number.isNaN(serviceId),
  });

  const ministriesQuery = useQuery({
    queryKey: ["church", "ministries"],
    queryFn: async () => (await listMinistries(accessToken!)).data,
    enabled: Boolean(accessToken),
  });

  const ministryOptions = useMemo(
    () => (ministriesQuery.data ?? []).map((m) => ({ id: String(m.id), label: m.name, description: m.code })),
    [ministriesQuery.data],
  );

  async function handleSubmit(values: ServiceEventRequest) {
    setServerError(null);
    try {
      await updateService(accessToken!, serviceId, values);
      toast.success("Service updated");
      setEditing(false);
      await serviceQuery.refetch();
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : "Unable to update service");
    }
  }

  async function handleHeadcount(event: FormEvent) {
    event.preventDefault();
    const count = Number(headcount);
    if (Number.isNaN(count) || count < 0) {
      toast.error("Enter a headcount");
      return;
    }
    try {
      await recordAttendance(accessToken!, {
        serviceEventId: serviceId,
        attendanceCount: count,
        notes: notes.trim() || undefined,
      });
      toast.success("Attendance recorded");
      setHeadcount("");
      setNotes("");
      await serviceQuery.refetch();
      await queryClient.invalidateQueries({ queryKey: ["church", "services"] });
      await queryClient.invalidateQueries({ queryKey: ["church", "attendance"] });
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Unable to record attendance");
    }
  }

  if (serviceQuery.isLoading) return <LoadingState />;
  if (serviceQuery.isError || !serviceQuery.data) return <ErrorAlert message="Unable to load service." />;

  const service = serviceQuery.data;

  if (editing) {
    return (
      <div className="space-y-4">
        <ChurchNav />
        <PageHeader
          breadcrumbs={[
            { label: "Church", href: "/church" },
            { label: "Services", href: "/church/services" },
            { label: service.name, href: `/church/services/${service.id}` },
            { label: "Edit" },
          ]}
          title="Edit service"
        />
        <ServiceForm
          ministryOptions={ministryOptions}
          submitLabel="Save changes"
          serverError={serverError}
          defaultValues={{
            name: service.name,
            serviceDate: new Date(`${service.serviceDate}T00:00:00`),
            startsAt: service.startsAt?.slice(0, 5) ?? "",
            location: service.location ?? "",
            ministryId: service.ministryId ? String(service.ministryId) : "",
            notes: service.notes ?? "",
          }}
          onSubmit={handleSubmit}
          onCancel={() => setEditing(false)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ChurchNav />
      <PageHeader
        breadcrumbs={[
          { label: "Church", href: "/church" },
          { label: "Services", href: "/church/services" },
          { label: service.name },
        ]}
        title={service.name}
        description={formatDate(service.serviceDate)}
        action={
          <PermissionGate roles={["ORG_ADMIN", "FUNDRAISING_MANAGER", "FINANCE_MANAGER", "STAFF"]}>
            <Button variant="outline" onClick={() => setEditing(true)}>
              Edit
            </Button>
          </PermissionGate>
        }
      />

      <DetailCard
        title="Service details"
        fields={[
          { label: "Time", value: service.startsAt?.slice(0, 5) ?? "—" },
          { label: "Location", value: service.location ?? "—" },
          { label: "Ministry", value: service.ministryName ?? "—" },
          { label: "Created", value: formatDateTime(service.createdAt) },
        ]}
      />

      {service.attendanceCount != null ? (
        <div className="rounded-lg border border-border bg-surface p-4">
          <p className="text-sm text-muted-foreground">Headcount</p>
          <p className="mt-1 text-2xl font-semibold">{service.attendanceCount}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            See the log on{" "}
            <Link href="/church/attendance" className="text-primary hover:underline">
              Attendance
            </Link>
            .
          </p>
        </div>
      ) : (
        <PermissionGate roles={["ORG_ADMIN", "FUNDRAISING_MANAGER", "FINANCE_MANAGER", "STAFF"]}>
          <form onSubmit={handleHeadcount} className="space-y-3 rounded-lg border border-border bg-surface p-4">
            <p className="text-sm font-medium">Record headcount</p>
            <div className="grid gap-3 sm:grid-cols-[8rem_1fr_auto] sm:items-end">
              <div className="space-y-1.5">
                <Label htmlFor="headcount">People</Label>
                <Input
                  id="headcount"
                  type="number"
                  min={0}
                  value={headcount}
                  onChange={(event) => setHeadcount(event.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="headcount-notes">Notes</Label>
                <Input id="headcount-notes" value={notes} onChange={(event) => setNotes(event.target.value)} />
              </div>
              <Button type="submit">Save</Button>
            </div>
          </form>
        </PermissionGate>
      )}
    </div>
  );
}
