import type { OrganizationType } from "@/types/api";

export interface OrganizationProfile {
  id: number;
  name: string;
  slug: string;
  type: OrganizationType;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  active: boolean;
  createdAt: string;
}

export interface OrganizationUpdateRequest {
  name: string;
  slug?: string;
  type: OrganizationType;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
}

export const INVITABLE_ROLES = [
  "FINANCE_MANAGER",
  "ACCOUNTANT",
  "FUNDRAISING_MANAGER",
  "PROGRAM_MANAGER",
  "STAFF",
  "VOLUNTEER",
  "AUDITOR",
  "VIEW_ONLY",
] as const;

export type InvitableRole = (typeof INVITABLE_ROLES)[number];
