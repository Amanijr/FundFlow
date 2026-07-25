import { Bell } from "lucide-react";

import { Button } from "@/components/ui/button";
import { NotificationBadge } from "@/components/notifications/notification-badge";
import type { ConnectionStatus } from "@/types/notification";
import { cn } from "@/lib/utils";

interface NotificationBellProps {
  unreadCount: number;
  connectionStatus?: ConnectionStatus;
  onClick?: () => void;
  className?: string;
}

export function NotificationBell({
  unreadCount,
  connectionStatus = "polling",
  onClick,
  className,
}: NotificationBellProps) {
  const ariaLabel =
    unreadCount > 0
      ? `Notifications, ${unreadCount} unread`
      : "Notifications";

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={cn("relative h-8 w-8", className)}
      aria-label={ariaLabel}
      onClick={onClick}
    >
      <Bell className="h-4 w-4" />
      <NotificationBadge count={unreadCount} />
      {connectionStatus === "disconnected" && (
        <span
          className="absolute bottom-0.5 right-0.5 h-2 w-2 rounded-full bg-amber-500 ring-2 ring-white"
          aria-hidden
        />
      )}
    </Button>
  );
}
