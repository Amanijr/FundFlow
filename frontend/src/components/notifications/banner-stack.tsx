"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { BannerAlert } from "@/components/notifications/banner-alert";
import { useApiContext } from "@/hooks/use-api-context";
import { listAnnouncements } from "@/lib/api/notifications";
import { useSessionPreferencesStore } from "@/stores/session-preferences-store";

const DISMISSED_KEY = "fundflow-dismissed-announcements";

function readDismissed(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(DISMISSED_KEY) ?? "[]") as string[];
  } catch {
    return [];
  }
}

function writeDismissed(ids: string[]) {
  localStorage.setItem(DISMISSED_KEY, JSON.stringify(ids));
}

export function BannerStack() {
  const { token, organizationId } = useApiContext();
  const simpleMode = useSessionPreferencesStore((state) => state.simpleMode);
  const [dismissed, setDismissed] = useState<string[]>([]);

  useEffect(() => {
    setDismissed(readDismissed());
  }, []);

  const announcementsQuery = useQuery({
    queryKey: ["announcements", organizationId],
    queryFn: async () => (await listAnnouncements(token!, organizationId)).data,
    enabled: Boolean(token),
  });

  const visible =
    announcementsQuery.data?.filter((item) => {
      if (dismissed.includes(item.id)) return false;
      // Simple mode: only critical banners stay visible.
      if (simpleMode && item.severity !== "critical") return false;
      return true;
    }) ?? [];

  function handleDismiss(id: string) {
    const next = [...dismissed, id];
    setDismissed(next);
    writeDismissed(next);
  }

  if (visible.length === 0) return null;

  return (
    <div>
      {visible.map((announcement) => (
        <BannerAlert
          key={announcement.id}
          announcement={announcement}
          onDismiss={announcement.dismissible ? handleDismiss : undefined}
        />
      ))}
    </div>
  );
}
