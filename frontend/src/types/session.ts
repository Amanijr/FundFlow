import type { OrganizationType, Role } from "@/types/api";

export type SubscriptionPlan = "STARTER" | "PROFESSIONAL" | "ENTERPRISE";

export type UserPresenceStatus = "online" | "away" | "busy" | "offline";

export type DisplayCurrency = "TZS" | "USD" | "EUR" | "GBP";

export interface OrganizationMembership {
  organizationId: number;
  name: string;
  slug: string;
  type: OrganizationType;
  role: Role;
  plan: SubscriptionPlan;
  fiscalYear: number;
  active: boolean;
  primaryCurrency: DisplayCurrency;
  timezone: string;
  address?: string;
  city?: string;
  country?: string;
  registrationNumber?: string;
  lastAccessedAt: string;
}

export interface UserSessionStats {
  pendingApprovals: number;
  assignedTasks: number;
  unreadNotifications: number;
  draftRecords: number;
}
