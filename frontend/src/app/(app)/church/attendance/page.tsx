"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { type ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { ChurchNav } from "@/components/church/church-nav";
import { EntitySelector } from "@/components/forms/entity-selector";
import { FormField } from "@/components/forms/form-field";
import { FormSection } from "@/components/forms/form-section";
import { ErrorAlert } from "@/components/feedback/error-alert";
import { LoadingState } from "@/components/feedback/loading-state";
import { PageHeader } from "@/components/layout/page-header";
import { SectionHeader } from "@/components/layout/section-header";
import { DataTable } from "@/components/tables/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { getAttendanceSummary, listAttendance, listServices, recordAttendance } from "@/lib/api/church";
import { formatDate, formatDateTime } from "@/lib/utils/dates";
import { ApiError } from "@/types/api";
import type { AttendanceRecordResponse } from "@/types/verticals";

const attendanceSchema = z.object({
  serviceEventId: z.string().min(1, "Choose a service"),
  attendanceCount: z.number().min(0),
  notes: z.string().max(1000).optional(),
});

type AttendanceFormValues = z.infer<typeof attendanceSchema>;

export default function ChurchAttendancePage() {
  const queryClient = useQueryClient();
  const { accessToken } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const servicesQuery = useQuery({
    queryKey: ["church", "services"],
    queryFn: async () => (await listServices(accessToken!)).data,
    enabled: Boolean(accessToken),
  });

  const attendanceQuery = useQuery({
    queryKey: ["church", "attendance"],
    queryFn: async () => (await listAttendance(accessToken!)).data,
    enabled: Boolean(accessToken),
  });

  const summaryQuery = useQuery({
    queryKey: ["church", "attendance", "summary"],
    queryFn: async () => (await getAttendanceSummary(accessToken!)).data,
    enabled: Boolean(accessToken),
  });

  const openServices = useMemo(
    () => (servicesQuery.data ?? []).filter((service) => service.attendanceCount == null),
    [servicesQuery.data],
  );

  const serviceOptions = useMemo(
    () =>
      openServices.map((service) => ({
        id: String(service.id),
        label: `${service.name} · ${formatDate(service.serviceDate)}`,
        description: service.ministryName,
      })),
    [openServices],
  );

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AttendanceFormValues>({
    resolver: zodResolver(attendanceSchema),
    defaultValues: {
      serviceEventId: "",
      attendanceCount: 0,
      notes: "",
    },
  });

  const columns = useMemo<ColumnDef<AttendanceRecordResponse>[]>(
    () => [
      {
        accessorKey: "serviceDate",
        header: "Date",
        cell: ({ row }) => formatDate(row.original.serviceDate),
      },
      {
        accessorKey: "eventName",
        header: "Service",
        cell: ({ row }) =>
          row.original.serviceEventId ? (
            <Link
              href={`/church/services/${row.original.serviceEventId}`}
              className="font-medium text-primary hover:underline"
            >
              {row.original.eventName}
            </Link>
          ) : (
            row.original.eventName
          ),
      },
      { accessorKey: "ministryName", header: "Ministry", cell: ({ row }) => row.original.ministryName ?? "—" },
      { accessorKey: "attendanceCount", header: "Count" },
      { accessorKey: "notes", header: "Notes", cell: ({ row }) => row.original.notes ?? "—" },
      {
        accessorKey: "createdAt",
        header: "Recorded",
        cell: ({ row }) => formatDateTime(row.original.createdAt),
      },
    ],
    [],
  );

  async function onSubmit(values: AttendanceFormValues) {
    setServerError(null);
    try {
      await recordAttendance(accessToken!, {
        serviceEventId: Number(values.serviceEventId),
        attendanceCount: values.attendanceCount,
        notes: values.notes || undefined,
      });
      toast.success("Attendance recorded");
      reset();
      setShowForm(false);
      await queryClient.invalidateQueries({ queryKey: ["church", "attendance"] });
      await queryClient.invalidateQueries({ queryKey: ["church", "services"] });
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : "Unable to record attendance");
    }
  }

  if (servicesQuery.isLoading || attendanceQuery.isLoading) return <LoadingState />;

  const summary = summaryQuery.data;

  return (
    <div className="space-y-4">
      <ChurchNav />
      <PageHeader
        breadcrumbs={[
          { label: "Church", href: "/church" },
          { label: "Attendance", href: "/church/attendance" },
        ]}
        title="Attendance"
        description="Headcount against a service. Named check-in comes later."
        action={
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/church/services/new">Add service</Link>
            </Button>
            <Button onClick={() => setShowForm((v) => !v)}>{showForm ? "Cancel" : "Record attendance"}</Button>
          </div>
        }
      />

      {summary && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-border bg-surface p-4">
            <p className="text-sm text-muted-foreground">Total attendance</p>
            <p className="mt-1 text-2xl font-semibold">{summary.totalAttendance}</p>
          </div>
          <div className="rounded-lg border border-border bg-surface p-4">
            <p className="text-sm text-muted-foreground">Records</p>
            <p className="mt-1 text-2xl font-semibold">{summary.recordCount}</p>
          </div>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 rounded-lg border border-border bg-surface p-6">
          {serverError && <ErrorAlert message={serverError} />}
          {openServices.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Every listed service already has a headcount.{" "}
              <Link href="/church/services/new" className="text-primary hover:underline">
                Add a service
              </Link>{" "}
              first.
            </p>
          ) : (
            <FormSection title="New attendance record" description="Count people at a service already on the calendar.">
              <FormField label="Service" error={errors.serviceEventId?.message} className="sm:col-span-2">
                <Controller
                  control={control}
                  name="serviceEventId"
                  render={({ field }) => (
                    <EntitySelector
                      options={serviceOptions}
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      placeholder="Select a service"
                    />
                  )}
                />
              </FormField>
              <FormField label="Attendance count" error={errors.attendanceCount?.message}>
                <Input type="number" min={0} {...register("attendanceCount", { valueAsNumber: true })} />
              </FormField>
              <FormField label="Notes" className="sm:col-span-2">
                <Input {...register("notes")} />
              </FormField>
            </FormSection>
          )}
          {openServices.length > 0 && (
            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting}>
                Save record
              </Button>
            </div>
          )}
        </form>
      )}

      <section className="space-y-4">
        <SectionHeader title="Recent records" />
        {attendanceQuery.isError && <ErrorAlert message="Unable to load attendance records." />}
        <DataTable columns={columns} data={attendanceQuery.data ?? []} />
      </section>
    </div>
  );
}
