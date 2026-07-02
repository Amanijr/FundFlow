"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { NotificationBell } from "@/components/notifications/notification-bell";
import { NotificationCenterPanel } from "@/components/notifications/notification-center-panel";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { useApiContext } from "@/hooks/use-api-context";
import { useIsMobile } from "@/hooks/use-media-query";
import { useNotificationRealtime } from "@/hooks/use-notification-realtime";
import { useUnreadNotificationCount } from "@/hooks/use-notifications";

export function NotificationCenter() {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const { organizationId } = useApiContext();
  const { connectionStatus, announcement } = useNotificationRealtime();
  const unreadQuery = useUnreadNotificationCount();
  const unreadCount = unreadQuery.data ?? 0;

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (nextOpen) {
      void queryClient.invalidateQueries({ queryKey: ["notifications", organizationId] });
    }
  }

  const trigger = (
    <NotificationBell
      unreadCount={unreadCount}
      connectionStatus={connectionStatus}
      onClick={isMobile ? () => handleOpenChange(true) : undefined}
    />
  );

  if (isMobile) {
    return (
      <>
        <div className="relative">
          {trigger}
          <div aria-live="polite" className="sr-only">
            {announcement}
          </div>
        </div>
        <Sheet open={open} onOpenChange={handleOpenChange}>
          <SheetContent
            showClose
            className="inset-y-0 right-0 left-auto h-full w-full max-w-md border-l border-stone-200"
          >
            <SheetTitle className="sr-only">Notifications</SheetTitle>
            <NotificationCenterPanel connectionStatus={connectionStatus} />
          </SheetContent>
        </Sheet>
      </>
    );
  }

  return (
    <>
      <div aria-live="polite" className="sr-only">
        {announcement}
      </div>
      <DropdownMenu open={open} onOpenChange={handleOpenChange}>
        <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-96 p-0">
          <NotificationCenterPanel connectionStatus={connectionStatus} compact />
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}

/** @deprecated Use NotificationCenter */
export const NotificationDropdown = NotificationCenter;
