"use client";

import { useQuery } from "@tanstack/react-query";
import { type ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

import { DateInput } from "@/components/forms/date-input";
import { ErrorAlert } from "@/components/feedback/error-alert";
import { LoadingState } from "@/components/feedback/loading-state";
import { PageHeader } from "@/components/layout/page-header";
import { LogSeverityBadge, LogTypeBadge } from "@/components/platform/log-status-badge";
import { DataTable } from "@/components/tables/data-table";
import { FilterBar } from "@/components/tables/filter-bar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { searchPlatformLogs } from "@/lib/api/platform";
import { toApiDate } from "@/lib/utils/dates";
import { formatDateTime } from "@/lib/utils/dates";
import type { LogSearchParams, LogSeverity, LogType, SystemLogResponse } from "@/types/platform";

const logTypes: LogType[] = ["EVENT", "ERROR", "EXCEPTION", "ALERT", "SECURITY"];
const severities: LogSeverity[] = ["INFO", "WARNING", "ERROR", "CRITICAL"];

export default function PlatformLogsPage() {
  const searchParams = useSearchParams();
  const { accessToken } = useAuth();
  const [search, setSearch] = useState("");
  const [type, setType] = useState<LogType | "">("");
  const [severity, setSeverity] = useState<LogSeverity | "">("");
  const [category, setCategory] = useState("");
  const [organizationId, setOrganizationId] = useState("");
  const [alertsOnly, setAlertsOnly] = useState(searchParams.get("alertsOnly") === "true");
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);

  const filters = useMemo<LogSearchParams>(
    () => ({
      type: type || undefined,
      severity: severity || undefined,
      category: category || undefined,
      organizationId: organizationId ? Number(organizationId) : undefined,
      alertsOnly,
      from: toApiDate(fromDate),
      to: toApiDate(toDate),
    }),
    [alertsOnly, category, fromDate, organizationId, severity, toDate, type],
  );

  const logsQuery = useQuery({
    queryKey: ["platform", "logs", filters],
    queryFn: async () => (await searchPlatformLogs(accessToken!, filters)).data,
    enabled: Boolean(accessToken),
  });

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return (logsQuery.data ?? []).filter(
      (log) =>
        log.message.toLowerCase().includes(q) ||
        log.category.toLowerCase().includes(q) ||
        (log.userEmail ?? "").toLowerCase().includes(q),
    );
  }, [logsQuery.data, search]);

  const columns = useMemo<ColumnDef<SystemLogResponse>[]>(
    () => [
      {
        accessorKey: "createdAt",
        header: "Time",
        cell: ({ row }) => formatDateTime(row.original.createdAt),
      },
      {
        accessorKey: "logType",
        header: "Type",
        cell: ({ row }) => <LogTypeBadge type={row.original.logType} />,
      },
      {
        accessorKey: "severity",
        header: "Severity",
        cell: ({ row }) => <LogSeverityBadge severity={row.original.severity} />,
      },
      { accessorKey: "category", header: "Category" },
      {
        accessorKey: "message",
        header: "Message",
        cell: ({ row }) => (
          <Link href={`/platform/dashboard/logs/${row.original.id}`} className="font-medium text-primary hover:underline">
            {row.original.message}
          </Link>
        ),
      },
      {
        accessorKey: "organizationId",
        header: "Org",
        cell: ({ row }) => row.original.organizationId ?? "—",
      },
    ],
    [],
  );

  function resetFilters() {
    setSearch("");
    setType("");
    setSeverity("");
    setCategory("");
    setOrganizationId("");
    setAlertsOnly(false);
    setFromDate(null);
    setToDate(null);
  }

  if (logsQuery.isLoading) return <LoadingState />;

  return (
    <div className="space-y-4">
      <PageHeader
        breadcrumbs={[{ label: "System logs" }]}
        title="System logs"
        description="Platform-wide events, errors, alerts, and security entries."
      />

      <div className="grid gap-2 rounded-md border border-border bg-muted/20 p-2 sm:grid-cols-2 lg:grid-cols-4">
        <label className="space-y-1 text-sm">
          <span className="text-muted-foreground">Type</span>
          <select
            className="h-9 w-full rounded-md border border-input bg-surface px-2.5 text-sm"
            value={type}
            onChange={(event) => setType(event.target.value as LogType | "")}
          >
            <option value="">All types</option>
            {logTypes.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1 text-sm">
          <span className="text-muted-foreground">Severity</span>
          <select
            className="h-9 w-full rounded-md border border-input bg-surface px-2.5 text-sm"
            value={severity}
            onChange={(event) => setSeverity(event.target.value as LogSeverity | "")}
          >
            <option value="">All severities</option>
            {severities.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1 text-sm">
          <span className="text-muted-foreground">Category</span>
          <Input value={category} onChange={(event) => setCategory(event.target.value)} placeholder="e.g. API" />
        </label>
        <label className="space-y-1 text-sm">
          <span className="text-muted-foreground">Organization ID</span>
          <Input
            value={organizationId}
            onChange={(event) => setOrganizationId(event.target.value)}
            placeholder="Optional"
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="text-muted-foreground">From</span>
          <DateInput value={fromDate} onChange={setFromDate} />
        </label>
        <label className="space-y-1 text-sm">
          <span className="text-muted-foreground">To</span>
          <DateInput value={toDate} onChange={setToDate} />
        </label>
        <label className="flex items-end gap-2 text-sm sm:col-span-2">
          <input
            type="checkbox"
            checked={alertsOnly}
            onChange={(event) => setAlertsOnly(event.target.checked)}
            className="rounded border-input"
          />
          Alerts only (unresolved)
        </label>
        <div className="flex items-end">
          <Button variant="outline" onClick={resetFilters}>
            Reset filters
          </Button>
        </div>
      </div>

      {logsQuery.isError && <ErrorAlert message="Unable to load system logs." />}
      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search message, category, email..."
        onReset={() => setSearch("")}
      />
      <DataTable columns={columns} data={filtered} globalFilter={search} />
    </div>
  );
}
