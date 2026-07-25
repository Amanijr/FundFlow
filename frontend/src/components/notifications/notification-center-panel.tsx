"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CheckCheck, RefreshCw, Settings } from "lucide-react";

import { NotificationCard } from "@/components/notifications/notification-card";
import { NotificationFiltersBar } from "@/components/notifications/notification-filters";
import { NotificationListSkeleton } from "@/components/notifications/notification-list-skeleton";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  useAcknowledgeNotification,
  useArchiveNotification,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
  useUnreadNotificationCount,
} from "@/hooks/use-notifications";
import { resolveNotificationHref } from "@/lib/notification-routes";
import type { ConnectionStatus, Notification, NotificationFilters } from "@/types/notification";
import { cn } from "@/lib/utils";

interface NotificationCenterPanelProps {
  connectionStatus?: ConnectionStatus;
  showFilters?: boolean;
  showSearch?: boolean;
  showFooter?: boolean;
  showArchiveActions?: boolean;
  compact?: boolean;
  fullHeight?: boolean;
  className?: string;
  filters?: NotificationFilters;
  onFiltersChange?: (filters: NotificationFilters) => void;
}

export function NotificationCenterPanel({
  connectionStatus = "polling",
  showFilters = true,
  showSearch = false,
  showFooter = true,
  showArchiveActions = false,
  compact = false,
  fullHeight = false,
  className,
  filters: controlledFilters,
  onFiltersChange,
}: NotificationCenterPanelProps) {
  const router = useRouter();
  const [internalFilters, setInternalFilters] = useState<NotificationFilters>({
    status: "all",
    size: compact ? 5 : 20,
  });
  const [search, setSearch] = useState("");
  const [criticalTarget, setCriticalTarget] = useState<Notification | null>(null);

  const filters = controlledFilters ?? internalFilters;
  const setFilters = onFiltersChange ?? setInternalFilters;

  const notificationsQuery = useNotifications({
    ...filters,
    q: search || filters.q,
  });
  const unreadQuery = useUnreadNotificationCount();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const acknowledge = useAcknowledgeNotification();
  const archive = useArchiveNotification();

  const items = notificationsQuery.data?.items ?? [];
  const unreadCount = unreadQuery.data ?? 0;

  function handleNotificationClick(notification: Notification) {
    if (notification.severity === "critical" && notification.status === "unread") {
      setCriticalTarget(notification);
      return;
    }

    if (notification.status === "unread") {
      void markRead.mutateAsync(notification.id);
    }

    const href = resolveNotificationHref(notification.link);
    if (href) router.push(href);
  }

  async function handleAcknowledge() {
    if (!criticalTarget) return;
    await acknowledge.mutateAsync(criticalTarget.id);
    const href = resolveNotificationHref(criticalTarget.link);
    setCriticalTarget(null);
    if (href) router.push(href);
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between gap-2 px-3 py-2">
        <div>
          <p className="text-sm font-semibold text-foreground">Notifications</p>
          {connectionStatus === "disconnected" && (
            <p className="text-xs text-amber-600">Connection lost — retrying</p>
          )}
        </div>
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1 px-2 text-xs"
            onClick={() => void markAllRead.mutateAsync()}
            disabled={markAllRead.isPending}
          >
            <CheckCheck className="h-3.5 w-3.5" />
            Mark all read
          </Button>
        )}
      </div>

      {showFilters && (
        <div className="space-y-2 border-b border-border px-3 pb-3">
          {showSearch && (
            <Input
              placeholder="Search notifications…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Search notifications"
            />
          )}
          <NotificationFiltersBar filters={filters} onChange={setFilters} />
        </div>
      )}

      <div
        className={cn(
          "overflow-y-auto",
          fullHeight ? "max-h-none" : "max-h-[min(24rem,60vh)]",
        )}
      >
        {notificationsQuery.isLoading && <NotificationListSkeleton />}

        {notificationsQuery.isError && (
          <div className="space-y-2 px-4 py-6 text-center">
            <p className="text-sm text-muted-foreground">Unable to load notifications.</p>
            <Button
              variant="outline"
              size="sm"
              className="gap-1"
              onClick={() => void notificationsQuery.refetch()}
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Retry
            </Button>
          </div>
        )}

        {!notificationsQuery.isLoading && !notificationsQuery.isError && items.length === 0 && (
          <div className="px-4 py-8 text-center">
            <p className="text-sm font-medium text-foreground">No notifications yet.</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Activity from donations, expenses, and workflows will appear here.
            </p>
          </div>
        )}

        {!notificationsQuery.isLoading &&
          items.map((notification) => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              compact={compact}
              showArchiveAction={showArchiveActions}
              onArchive={() => void archive.mutateAsync(notification.id)}
              onClick={() => handleNotificationClick(notification)}
            />
          ))}
      </div>

      {showFooter && (
        <div className="flex items-center justify-between border-t border-border px-3 py-2">
          <Link
            href="/notifications"
            className="text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            View all notifications
          </Link>
          <Link
            href="/settings/notifications"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <Settings className="h-3 w-3" />
            Settings
          </Link>
        </div>
      )}

      <Dialog open={!!criticalTarget} onOpenChange={(open) => !open && setCriticalTarget(null)}>
        <DialogContent showClose={false}>
          <DialogHeader>
            <DialogTitle>{criticalTarget?.title}</DialogTitle>
            <DialogDescription>{criticalTarget?.body}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCriticalTarget(null)}>
              Dismiss
            </Button>
            <Button onClick={() => void handleAcknowledge()} disabled={acknowledge.isPending}>
              Acknowledge
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
