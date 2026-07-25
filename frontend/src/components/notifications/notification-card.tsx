import {
  AlertTriangle,
  Archive,
  Bell,
  CheckCircle2,
  CircleDollarSign,
  FileText,
  Info,
  Shield,
  Users,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

import { getCategoryLabel } from "@/lib/notification-categories";
import type { Notification, NotificationCategory, NotificationSeverity } from "@/types/notification";
import { cn } from "@/lib/utils";

const SEVERITY_BORDER: Record<NotificationSeverity, string> = {
  info: "",
  success: "",
  warning: "border-l-2 border-l-amber-500",
  critical: "border-l-2 border-l-red-600",
};

const SEVERITY_ICON: Record<NotificationSeverity, string> = {
  info: "text-muted-foreground",
  success: "text-emerald-600",
  warning: "text-amber-600",
  critical: "text-red-600",
};

const CATEGORY_ICONS: Record<NotificationCategory, typeof Bell> = {
  financial: CircleDollarSign,
  donations: Bell,
  campaigns: Bell,
  budgets: CircleDollarSign,
  expenses: FileText,
  users: Users,
  security: Shield,
  workflow: CheckCircle2,
  reports: FileText,
  system: Info,
};

function SeverityIcon({ severity }: { severity: NotificationSeverity }) {
  if (severity === "critical" || severity === "warning") {
    return <AlertTriangle className={cn("h-4 w-4 shrink-0", SEVERITY_ICON[severity])} />;
  }
  if (severity === "success") {
    return <CheckCircle2 className={cn("h-4 w-4 shrink-0", SEVERITY_ICON[severity])} />;
  }
  return <Info className={cn("h-4 w-4 shrink-0", SEVERITY_ICON[severity])} />;
}

interface NotificationCardProps {
  notification: Notification;
  onClick?: () => void;
  onArchive?: () => void;
  showArchiveAction?: boolean;
  compact?: boolean;
  className?: string;
}

export function NotificationCard({
  notification,
  onClick,
  onArchive,
  showArchiveAction = false,
  compact = false,
  className,
}: NotificationCardProps) {
  const isUnread = notification.status === "unread";
  const CategoryIcon = CATEGORY_ICONS[notification.category] ?? Bell;
  const relativeTime = formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true });

  return (
    <div
      className={cn(
        "group flex w-full gap-3 rounded-md px-3 py-2.5 text-left transition-colors hover:bg-accent/30",
        SEVERITY_BORDER[notification.severity],
        className,
      )}
    >
      <button type="button" onClick={onClick} className="flex min-w-0 flex-1 gap-3 text-left">
        <div className="mt-0.5">
          {notification.severity === "info" ? (
            <CategoryIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
          ) : (
            <SeverityIcon severity={notification.severity} />
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-start justify-between gap-2">
            <p
              className={cn(
                "text-sm leading-snug",
                isUnread ? "font-medium text-foreground" : "text-muted-foreground",
              )}
            >
              {notification.title}
            </p>
            {isUnread && (
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-stone-900" aria-hidden />
            )}
          </div>
          {!compact && notification.body && (
            <p className="line-clamp-2 text-xs text-muted-foreground">{notification.body}</p>
          )}
          <p className="text-xs text-muted-foreground">
            {getCategoryLabel(notification.category)} · {relativeTime}
          </p>
        </div>
      </button>
      {showArchiveAction && notification.status !== "archived" && onArchive && (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onArchive();
          }}
          className="mt-0.5 shrink-0 rounded-md p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-accent hover:text-foreground group-hover:opacity-100 focus:opacity-100"
          aria-label="Archive notification"
        >
          <Archive className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
