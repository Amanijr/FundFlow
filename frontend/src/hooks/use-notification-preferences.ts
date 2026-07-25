"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useApiContext } from "@/hooks/use-api-context";
import { getNotificationPreferences, updateNotificationPreferences } from "@/lib/api/notifications";
import type { NotificationPreferences } from "@/types/notification";

export function useNotificationPreferences() {
  const { token, organizationId } = useApiContext();

  return useQuery({
    queryKey: ["notifications", "preferences", organizationId],
    queryFn: async () => (await getNotificationPreferences(token!, organizationId)).data,
    enabled: Boolean(token),
  });
}

export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient();
  const { token, organizationId } = useApiContext();

  return useMutation({
    mutationFn: (body: Partial<NotificationPreferences>) =>
      updateNotificationPreferences(token!, body, organizationId),
    onSuccess: (response) => {
      queryClient.setQueryData(
        ["notifications", "preferences", organizationId],
        response.data,
      );
      toast.success("Notification preferences saved");
    },
    onError: () => {
      toast.error("Unable to save preferences");
    },
  });
}
