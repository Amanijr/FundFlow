import Link from "next/link";

import { cn } from "@/lib/utils";
import type { UserSessionStats } from "@/types/session";

interface ProfileQuickStatsProps {
  stats: UserSessionStats;
  className?: string;
}

const statLinks = [
  { key: "pendingApprovals" as const, label: "Pending Approvals", href: "/approvals" },
  { key: "assignedTasks" as const, label: "Assigned Tasks", href: "/approvals" },
  { key: "unreadNotifications" as const, label: "Unread Notifications", href: "/notifications" },
  { key: "draftRecords" as const, label: "Draft Records", href: "/expenses" },
];

export function ProfileQuickStats({ stats, className }: ProfileQuickStatsProps) {
  return (
    <div className={cn("grid grid-cols-2 gap-2", className)}>
      {statLinks.map((item) => (
        <Link
          key={item.key}
          href={item.href}
          className="rounded-md border border-border bg-surface px-3 py-2 transition-colors hover:bg-accent/30"
        >
          <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            {item.label}
          </p>
          <p className="mt-0.5 text-lg font-semibold tabular-nums text-foreground">{stats[item.key]}</p>
        </Link>
      ))}
    </div>
  );
}
