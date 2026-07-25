"use client";

import { useQuery } from "@tanstack/react-query";

import { useApiContext } from "@/hooks/use-api-context";
import { listActivityFeed } from "@/lib/api/notifications";

interface UseActivityFeedOptions {
  entityType?: string;
  entityId?: string;
  enabled?: boolean;
}

export function useActivityFeed(options: UseActivityFeedOptions = {}) {
  const { token, organizationId } = useApiContext();
  const { entityType, entityId, enabled = true } = options;

  return useQuery({
    queryKey: ["activity", organizationId, entityType, entityId],
    queryFn: async () =>
      (await listActivityFeed(token!, organizationId, { entityType, entityId })).data.items,
    enabled: Boolean(token) && enabled,
  });
}
