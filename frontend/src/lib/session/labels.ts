import type { OrganizationType, Role } from "@/types/api";
import type { SubscriptionPlan, UserPresenceStatus } from "@/types/session";

const ORG_TYPE_LABELS: Record<OrganizationType, string> = {
  CHURCH: "Church",
  NGO: "Non-Profit Organization",
  FOUNDATION: "Foundation",
  CHARITY: "Charity",
  COMMUNITY_ORGANIZATION: "Community Organization",
  SCHOOL: "School",
  RELIGIOUS_INSTITUTION: "Religious Institution",
};

const ROLE_LABELS: Record<Role, string> = {
  SUPER_ADMIN: "Platform Administrator",
  ORG_ADMIN: "Organization Administrator",
  FINANCE_MANAGER: "Finance Manager",
  ACCOUNTANT: "Accountant",
  FUNDRAISING_MANAGER: "Fundraising Manager",
  PROGRAM_MANAGER: "Program Manager",
  STAFF: "Staff Member",
  VOLUNTEER: "Volunteer",
  AUDITOR: "Auditor",
  DONOR: "Donor",
  VIEW_ONLY: "View Only",
};

const PLAN_LABELS: Record<SubscriptionPlan, string> = {
  STARTER: "Starter Plan",
  PROFESSIONAL: "Professional Plan",
  ENTERPRISE: "Enterprise Plan",
};

const PRESENCE_LABELS: Record<UserPresenceStatus, string> = {
  online: "Online",
  away: "Away",
  busy: "Busy",
  offline: "Offline",
};

export function formatOrganizationType(type: OrganizationType) {
  return ORG_TYPE_LABELS[type] ?? type.replaceAll("_", " ");
}

export function formatRoleLabel(role: Role) {
  return ROLE_LABELS[role] ?? role.replaceAll("_", " ");
}

export function formatSubscriptionPlan(plan: SubscriptionPlan) {
  return PLAN_LABELS[plan] ?? plan;
}

export function formatPresenceStatus(status: UserPresenceStatus) {
  return PRESENCE_LABELS[status] ?? status;
}

export function formatFiscalYear(year: number) {
  return `FY ${year}`;
}
