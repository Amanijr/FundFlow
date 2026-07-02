import type {
  CategoryPreference,
  DeliveryChannel,
  Notification,
  NotificationPreferences,
  SystemAnnouncement,
} from "@/types/notification";
import type { ActivityEvent } from "@/types/workflow";

import { NOTIFICATION_CATEGORIES } from "@/lib/notification-categories";

const now = Date.now();

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: "n1",
    title: "Donation received",
    body: "A new donation of $500 was recorded for the Spring Appeal campaign.",
    severity: "info",
    category: "donations",
    status: "unread",
    createdAt: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
    actor: { id: 1, name: "System" },
    link: { href: "/donations/1", entityType: "donation", entityId: 1 },
    organizationId: 1,
  },
  {
    id: "n2",
    title: "Budget approved",
    body: "Q2 Operations budget has been approved by Finance Manager.",
    severity: "success",
    category: "budgets",
    status: "unread",
    createdAt: new Date(now - 5 * 60 * 60 * 1000).toISOString(),
    actor: { id: 2, name: "David Mwangi" },
    link: { href: "/budgets/1", entityType: "budget", entityId: 1 },
    organizationId: 1,
  },
  {
    id: "n3",
    title: "Expense rejected",
    body: "Expense #1042 was rejected. Please review the comments and resubmit.",
    severity: "warning",
    category: "expenses",
    status: "read",
    createdAt: new Date(now - 24 * 60 * 60 * 1000).toISOString(),
    readAt: new Date(now - 20 * 60 * 60 * 1000).toISOString(),
    actor: { id: 2, name: "David Mwangi" },
    link: { href: "/expenses/1", entityType: "expense", entityId: 1 },
    organizationId: 1,
  },
  {
    id: "n4",
    title: "New user invitation",
    body: "An invitation was sent to jane@example.org.",
    severity: "info",
    category: "users",
    status: "read",
    createdAt: new Date(now - 2 * 24 * 60 * 60 * 1000).toISOString(),
    readAt: new Date(now - 2 * 24 * 60 * 60 * 1000).toISOString(),
    organizationId: 1,
  },
  {
    id: "n5",
    title: "Payment failed",
    body: "Recurring donation payment could not be processed. Action required.",
    severity: "critical",
    category: "financial",
    status: "unread",
    createdAt: new Date(now - 30 * 60 * 1000).toISOString(),
    link: { href: "/donations/2", entityType: "donation", entityId: 2 },
    organizationId: 1,
  },
  {
    id: "n6",
    title: "Campaign ending soon",
    body: "Spring Appeal ends in 3 days. Review progress and outreach plan.",
    severity: "warning",
    category: "campaigns",
    status: "unread",
    createdAt: new Date(now - 6 * 60 * 60 * 1000).toISOString(),
    link: { href: "/campaigns/1", entityType: "campaign", entityId: 1 },
    organizationId: 1,
  },
];

let notifications: Notification[] = [...INITIAL_NOTIFICATIONS];

export function getMockNotifications(): Notification[] {
  return notifications;
}

export function resetMockNotifications(): void {
  notifications = [...INITIAL_NOTIFICATIONS];
}

export function updateMockNotification(
  id: string,
  updates: Partial<Notification>,
): Notification | null {
  const index = notifications.findIndex((item) => item.id === id);
  if (index === -1) return null;
  notifications[index] = { ...notifications[index], ...updates };
  return notifications[index];
}

export function markAllMockNotificationsRead(): void {
  const readAt = new Date().toISOString();
  notifications = notifications.map((item) =>
    item.status === "unread" ? { ...item, status: "read", readAt } : item,
  );
}

export const MOCK_ACTIVITY_FEED: ActivityEvent[] = [
  {
    id: "a1",
    title: "Donation created",
    description: "Donation #4521 for $500 recorded.",
    timestamp: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
    actor: "Sarah Kimaro",
    action: "created",
    entityType: "donation",
    entityId: 1,
    link: "/donations/1",
    status: "success",
  },
  {
    id: "a2",
    title: "Expense approved",
    description: "Expense #1042 for $250 was approved.",
    timestamp: new Date(now - 5 * 60 * 60 * 1000).toISOString(),
    actor: "David Mwangi",
    action: "approved",
    entityType: "expense",
    entityId: 1,
    link: "/expenses/1",
    status: "success",
  },
  {
    id: "a3",
    title: "Budget modified",
    description: "Q2 Operations budget line items updated.",
    timestamp: new Date(now - 24 * 60 * 60 * 1000).toISOString(),
    actor: "Grace Admin",
    action: "updated",
    entityType: "budget",
    entityId: 1,
    link: "/budgets/1",
    status: "neutral",
  },
  {
    id: "a4",
    title: "User role changed",
    description: "Jane Doe promoted to Finance Manager.",
    timestamp: new Date(now - 2 * 24 * 60 * 60 * 1000).toISOString(),
    actor: "Grace Admin",
    action: "updated",
    entityType: "user",
    status: "neutral",
  },
];

export const MOCK_ANNOUNCEMENTS: SystemAnnouncement[] = [
  {
    id: "ann-1",
    severity: "info",
    title: "Scheduled maintenance",
    description: "FundFlow will undergo maintenance Sunday 2:00–4:00 AM EAT.",
    dismissible: true,
  },
];

function buildDefaultCategoryPreferences(): CategoryPreference[] {
  return NOTIFICATION_CATEGORIES.map((item) => ({
    category: item.value,
    enabled: true,
    channels: ["in_app", "email"] as DeliveryChannel[],
    minSeverity: item.value === "financial" || item.value === "system" ? "warning" : "info",
  }));
}

export let mockNotificationPreferences: NotificationPreferences = {
  userId: 1,
  organizationId: 1,
  globalEnabled: true,
  categories: buildDefaultCategoryPreferences(),
  digest: { enabled: false, frequency: "daily", time: "09:00" },
  updatedAt: new Date().toISOString(),
};

export function updateMockNotificationPreferences(
  updates: Partial<NotificationPreferences>,
): NotificationPreferences {
  mockNotificationPreferences = {
    ...mockNotificationPreferences,
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  return mockNotificationPreferences;
}
