"use client";

import Link from "next/link";

import { formatDate } from "@/lib/utils/dates";
import { formatCurrency, toNumber } from "@/lib/utils/format";
import type { ChurchDashboardResponse } from "@/types/verticals";

function SnapshotCard({
  href,
  label,
  value,
  hint,
}: {
  href: string;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-xl border border-border bg-surface p-4 transition-colors hover:border-foreground/15 hover:bg-muted/30"
    >
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-semibold text-foreground">{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </Link>
  );
}

export function ChurchHomeSnapshot({ data }: { data: ChurchDashboardResponse }) {
  const lastHint =
    data.lastServiceName && data.lastServiceDate
      ? `${data.lastServiceName} · ${formatDate(data.lastServiceDate)}`
      : "No service counted yet";

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <SnapshotCard
        href="/church/collections"
        label="Offerings to finish"
        value={String(data.collectionsNeedingAction)}
        hint="Draft or counted sessions"
      />
      <SnapshotCard
        href="/church/attendance"
        label="Last headcount"
        value={data.lastAttendanceCount != null ? String(data.lastAttendanceCount) : "—"}
        hint={lastHint}
      />
      <SnapshotCard
        href="/funds"
        label="Funds remaining"
        value={formatCurrency(toNumber(data.fundsRemaining))}
        hint="Opening + giving − spend"
      />
      <SnapshotCard
        href="/reports/donations"
        label="Giving this year"
        value={formatCurrency(toNumber(data.givingThisYear))}
        hint={`${data.activeMemberCount} active members`}
      />
    </div>
  );
}
