"use client";

import { format } from "date-fns";

import { useAuth } from "@/hooks/use-auth";
import { useExecutiveDashboard } from "@/hooks/use-analytics";
import { Skeleton } from "@/components/ui/skeleton";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function WelcomeBanner() {
  const { user } = useAuth();
  const { data, isLoading } = useExecutiveDashboard();

  if (isLoading) {
    return (
      <div className="rounded-md border border-border bg-surface px-4 py-3">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="mt-2 h-4 w-64" />
      </div>
    );
  }

  const name = user ? `${user.firstName} ${user.lastName}`.trim() || user.email : "there";
  const org = "your organization";
  const today = format(new Date(), "EEEE, MMMM d, yyyy");
  const period = data ? `${data.fromDate} → ${data.toDate}` : undefined;

  return (
    <div className="flex flex-col gap-1 rounded-md border border-border bg-surface px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-semibold text-foreground">
          {getGreeting()}, {name}
        </p>
        <p className="text-xs text-muted-foreground">{org}</p>
      </div>
      <div className="text-left sm:text-right">
        <p className="text-xs text-muted-foreground">{today}</p>
        {period && <p className="text-xs text-muted-foreground">Reporting period: {period}</p>}
      </div>
    </div>
  );
}
