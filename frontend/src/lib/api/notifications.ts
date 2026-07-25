import { apiRequest } from "@/lib/api/client";
import type {
  Notification,
  NotificationFilters,
  NotificationListResponse,
  NotificationPreferences,
  SystemAnnouncement,
} from "@/types/notification";
import type { ActivityEvent } from "@/types/workflow";

function buildQuery(filters?: NotificationFilters): string {
  if (!filters) return "";
  const params = new URLSearchParams();
  if (filters.status && filters.status !== "all") params.set("status", filters.status);
  if (filters.category) params.set("category", filters.category);
  if (filters.severity) params.set("severity", filters.severity);
  if (filters.from) params.set("from", filters.from);
  if (filters.to) params.set("to", filters.to);
  if (filters.q) params.set("q", filters.q);
  if (filters.page != null) params.set("page", String(filters.page));
  if (filters.size != null) params.set("size", String(filters.size));
  const query = params.toString();
  return query ? `?${query}` : "";
}

export function listNotifications(
  token: string,
  organizationId?: number,
  filters?: NotificationFilters,
) {
  return apiRequest<NotificationListResponse>(
    `/api/v1/notifications${buildQuery(filters)}`,
    { token, organizationId },
  );
}

export function getUnreadCount(token: string, organizationId?: number) {
  return apiRequest<number>("/api/v1/notifications/unread-count", { token, organizationId });
}

export function getNotification(token: string, id: string, organizationId?: number) {
  return apiRequest<Notification>(`/api/v1/notifications/${id}`, { token, organizationId });
}

export function markNotificationRead(token: string, id: string, organizationId?: number) {
  return apiRequest<Notification>(`/api/v1/notifications/${id}/read`, {
    method: "POST",
    token,
    organizationId,
  });
}

export function markAllNotificationsRead(token: string, organizationId?: number) {
  return apiRequest<void>("/api/v1/notifications/read-all", {
    method: "POST",
    token,
    organizationId,
  });
}

export function acknowledgeNotification(token: string, id: string, organizationId?: number) {
  return apiRequest<Notification>(`/api/v1/notifications/${id}/acknowledge`, {
    method: "POST",
    token,
    organizationId,
  });
}

export function archiveNotification(token: string, id: string, organizationId?: number) {
  return apiRequest<Notification>(`/api/v1/notifications/${id}/archive`, {
    method: "POST",
    token,
    organizationId,
  });
}

export function getNotificationPreferences(token: string, organizationId?: number) {
  return apiRequest<NotificationPreferences>("/api/v1/notifications/preferences", {
    token,
    organizationId,
  });
}

export function updateNotificationPreferences(
  token: string,
  body: Partial<NotificationPreferences>,
  organizationId?: number,
) {
  return apiRequest<NotificationPreferences>("/api/v1/notifications/preferences", {
    method: "PUT",
    token,
    organizationId,
    body,
  });
}

export function listActivityFeed(
  token: string,
  organizationId?: number,
  params?: { entityType?: string; entityId?: string; page?: number; size?: number },
) {
  const search = new URLSearchParams();
  if (params?.entityType) search.set("entityType", params.entityType);
  if (params?.entityId) search.set("entityId", params.entityId);
  if (params?.page != null) search.set("page", String(params.page));
  if (params?.size != null) search.set("size", String(params.size));
  const query = search.toString();
  return apiRequest<{ items: ActivityEvent[] }>(
    `/api/v1/activity/feed${query ? `?${query}` : ""}`,
    { token, organizationId },
  );
}

export function listAnnouncements(token: string, organizationId?: number) {
  return apiRequest<SystemAnnouncement[]>("/api/v1/announcements/active", {
    token,
    organizationId,
  });
}
