"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { BannerAlert } from "@/components/notifications/banner-alert";
import { useApiContext } from "@/hooks/use-api-context";
import { listAnnouncements } from "@/lib/api/notifications";

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
    announcementsQuery.data?.filter((item) => !dismissed.includes(item.id)) ?? [];

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
