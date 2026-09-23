"use client";

import { useQuery } from "@tanstack/react-query";
import { type ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { useMemo } from "react";

import { ExportActions } from "@/components/reports/export-actions";
import { ReportSummary } from "@/components/reports/report-summary";
import { ReportsNav } from "@/components/reports/reports-nav";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable } from "@/components/tables/data-table";
import { ErrorAlert } from "@/components/feedback/error-alert";
import { LoadingState } from "@/components/feedback/loading-state";
import { useAuth } from "@/hooks/use-auth";
import { getAttendanceSummary, listAttendance } from "@/lib/api/church";
import { formatDate } from "@/lib/utils/dates";
import type { AttendanceRecordResponse } from "@/types/verticals";

export default function AttendanceReportPage() {
  const { accessToken } = useAuth();

  const summaryQuery = useQuery({
    queryKey: ["church", "attendance", "summary"],
    queryFn: async () => (await getAttendanceSummary(accessToken!)).data,
    enabled: Boolean(accessToken),
  });

  const recordsQuery = useQuery({
    queryKey: ["church", "attendance"],
    queryFn: async () => (await listAttendance(accessToken!)).data,
    enabled: Boolean(accessToken),
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
            <Link href={`/church/services/${row.original.serviceEventId}`} className="text-primary hover:underline">
              {row.original.eventName}
            </Link>
          ) : (
            row.original.eventName
          ),
      },
      { accessorKey: "ministryName", header: "Ministry", cell: ({ row }) => row.original.ministryName ?? "—" },
      { accessorKey: "attendanceCount", header: "Headcount" },
    ],
    [],
  );

  if (summaryQuery.isLoading || recordsQuery.isLoading) return <LoadingState />;
  if (summaryQuery.isError || recordsQuery.isError) {
    return <ErrorAlert message="Unable to load the attendance report." />;
  }

  const summary = summaryQuery.data;
  const records = recordsQuery.data ?? [];

  return (
    <div className="space-y-4">
      <PageHeader title="Reports" description="Giving, members, attendance, and funds." />
      <ReportsNav />
      <PageHeader
        title="Attendance"
        description="Headcount by service. Named check-in is not in this report."
        action={
          <ExportActions
            filename="attendance-report"
            headers={["Date", "Service", "Ministry", "Headcount"]}
            rows={records.map((row) => [
              row.serviceDate,
              row.eventName,
              row.ministryName ?? "",
              row.attendanceCount,
            ])}
          />
        }
      />
      {summary ? (
        <ReportSummary
          metrics={[
            { label: "Total attendance", value: String(summary.totalAttendance) },
            { label: "Services counted", value: String(summary.recordCount) },
          ]}
        />
      ) : null}
      <DataTable columns={columns} data={records} />
    </div>
  );
}
