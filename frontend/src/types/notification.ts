export type NotificationSeverity = "info" | "success" | "warning" | "critical";

export type NotificationCategory =
  | "financial"
  | "donations"
  | "campaigns"
  | "budgets"
  | "expenses"
  | "users"
  | "security"
  | "workflow"
  | "reports"
  | "system";

export type NotificationStatus = "unread" | "read" | "acknowledged" | "archived";

export type DeliveryChannel = "in_app" | "email" | "sms" | "push";

export type ConnectionStatus = "connected" | "polling" | "disconnected";

export interface NotificationLink {
  href: string;
  entityType: string;
  entityId: string | number;
}

export interface Notification {
  id: string;
  title: string;
  body?: string;
  severity: NotificationSeverity;
  category: NotificationCategory;
  status: NotificationStatus;
  createdAt: string;
  readAt?: string;
  acknowledgedAt?: string;
  actor?: {
    id: number;
    name: string;
  };
  link?: NotificationLink;
  organizationId: number;
}

export interface NotificationListResponse {
  items: Notification[];
  page: number;
  totalPages: number;
  totalElements: number;
}

export interface NotificationFilters {
  status?: "unread" | "read" | "archived" | "all";
  category?: NotificationCategory;
  severity?: NotificationSeverity;
  from?: string;
  to?: string;
  q?: string;
  page?: number;
  size?: number;
}

export interface CategoryPreference {
  category: NotificationCategory;
  enabled: boolean;
  channels: DeliveryChannel[];
  minSeverity?: NotificationSeverity;
}

export interface DigestPreference {
  enabled: boolean;
  frequency: "daily" | "weekly";
  time?: string;
  dayOfWeek?: number;
}

export interface NotificationPreferences {
  userId: number;
  organizationId?: number;
  categories: CategoryPreference[];
  digest: DigestPreference;
  globalEnabled: boolean;
  updatedAt: string;
}

export interface SystemAnnouncement {
  id: string;
  severity: "info" | "warning" | "critical";
  title: string;
  description?: string;
  dismissible: boolean;
  href?: string;
}
