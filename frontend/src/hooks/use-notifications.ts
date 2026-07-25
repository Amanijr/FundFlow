"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useApiContext } from "@/hooks/use-api-context";
import {
  acknowledgeNotification,
  archiveNotification,
  getUnreadCount,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/api/notifications";
import type { Notification, NotificationFilters } from "@/types/notification";

function notificationQueryKey(organizationId?: number, filters?: NotificationFilters) {
  return ["notifications", organizationId, filters ?? {}] as const;
}

export function useNotifications(filters?: NotificationFilters) {
  const { token, organizationId } = useApiContext();

  return useQuery({
    queryKey: notificationQueryKey(organizationId, filters),
    queryFn: async () =>
      (await listNotifications(token!, organizationId, filters)).data,
    enabled: Boolean(token),
  });
}

export function useUnreadNotificationCount() {
  const { token, organizationId } = useApiContext();

  return useQuery({
    queryKey: ["notifications", "unread-count", organizationId],
    queryFn: async () => (await getUnreadCount(token!, organizationId)).data,
    enabled: Boolean(token),
  });
}

function patchNotificationInCache(
  queryClient: ReturnType<typeof useQueryClient>,
  organizationId: number | undefined,
  id: string,
  patch: Partial<Notification>,
) {
  queryClient.setQueriesData<{ items: Notification[] }>(
    { queryKey: ["notifications", organizationId] },
    (old) => {
      if (!old?.items) return old;
      return {
        ...old,
        items: old.items.map((item) => (item.id === id ? { ...item, ...patch } : item)),
      };
    },
  );
}

function markAllReadInCache(
  queryClient: ReturnType<typeof useQueryClient>,
  organizationId: number | undefined,
) {
  const readAt = new Date().toISOString();
  queryClient.setQueriesData<{ items: Notification[] }>(
    { queryKey: ["notifications", organizationId] },
    (old) => {
      if (!old?.items) return old;
      return {
        ...old,
        items: old.items.map((item) =>
          item.status === "unread" ? { ...item, status: "read", readAt } : item,
        ),
      };
    },
  );
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  const { token, organizationId } = useApiContext();

  return useMutation({
    mutationFn: (id: string) => markNotificationRead(token!, id, organizationId),
    onMutate: async (id) => {
      patchNotificationInCache(queryClient, organizationId, id, {
        status: "read",
        readAt: new Date().toISOString(),
      });
      queryClient.setQueryData(["notifications", "unread-count", organizationId], (count: number) =>
        Math.max(0, (count ?? 0) - 1),
      );
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["notifications", organizationId] });
      void queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count", organizationId] });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  const { token, organizationId } = useApiContext();

  return useMutation({
    mutationFn: () => markAllNotificationsRead(token!, organizationId),
    onMutate: async () => {
      markAllReadInCache(queryClient, organizationId);
      queryClient.setQueryData(["notifications", "unread-count", organizationId], 0);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["notifications", organizationId] });
      void queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count", organizationId] });
    },
  });
}

export function useAcknowledgeNotification() {
  const queryClient = useQueryClient();
  const { token, organizationId } = useApiContext();

  return useMutation({
    mutationFn: (id: string) => acknowledgeNotification(token!, id, organizationId),
    onMutate: async (id) => {
      patchNotificationInCache(queryClient, organizationId, id, {
        status: "acknowledged",
        acknowledgedAt: new Date().toISOString(),
        readAt: new Date().toISOString(),
      });
      queryClient.setQueryData(["notifications", "unread-count", organizationId], (count: number) =>
        Math.max(0, (count ?? 0) - 1),
      );
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["notifications", organizationId] });
      void queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count", organizationId] });
    },
  });
}

export function useArchiveNotification() {
  const queryClient = useQueryClient();
  const { token, organizationId } = useApiContext();

  return useMutation({
    mutationFn: (id: string) => archiveNotification(token!, id, organizationId),
    onMutate: async (id) => {
      patchNotificationInCache(queryClient, organizationId, id, { status: "archived" });
      const item = queryClient
        .getQueriesData<{ items: Notification[] }>({ queryKey: ["notifications", organizationId] })
        .flatMap(([, data]) => data?.items ?? [])
        .find((n) => n.id === id);
      if (item?.status === "unread") {
        queryClient.setQueryData(["notifications", "unread-count", organizationId], (count: number) =>
          Math.max(0, (count ?? 0) - 1),
        );
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["notifications", organizationId] });
      void queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count", organizationId] });
    },
  });
}
