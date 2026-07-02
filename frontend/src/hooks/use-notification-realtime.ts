"use client";

import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { useApiContext } from "@/hooks/use-api-context";
import { isMockApiEnabled } from "@/lib/mock/config";
import type { ConnectionStatus } from "@/types/notification";

const POLL_INTERVAL_MS = 30_000;

export function useNotificationRealtime() {
  const queryClient = useQueryClient();
  const { token, organizationId } = useApiContext();
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("disconnected");
  const [announcement, setAnnouncement] = useState<string | null>(null);
  const previousCountRef = useRef<number | null>(null);

  useEffect(() => {
    if (!token) {
      setConnectionStatus("disconnected");
      return;
    }

    setConnectionStatus(isMockApiEnabled() ? "polling" : "polling");

    const interval = window.setInterval(() => {
      void queryClient.invalidateQueries({
        queryKey: ["notifications", "unread-count", organizationId],
      });
    }, POLL_INTERVAL_MS);

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        void queryClient.invalidateQueries({
          queryKey: ["notifications", organizationId],
        });
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [token, organizationId, queryClient]);

  useEffect(() => {
    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      if (event.type !== "updated") return;
      const query = event.query;
      if (query.queryKey[0] !== "notifications" || query.queryKey[1] !== "unread-count") return;

      const count = query.state.data as number | undefined;
      if (count == null) return;

      if (previousCountRef.current != null && count > previousCountRef.current) {
        setAnnouncement(`You have ${count} unread notifications`);
        window.setTimeout(() => setAnnouncement(null), 3000);
      }
      previousCountRef.current = count;
    });

    return unsubscribe;
  }, [queryClient]);

  return { connectionStatus, announcement };
}
