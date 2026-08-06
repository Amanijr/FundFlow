import type { OrganizationType, Role } from "@/types/api";

const ADMIN: Role[] = ["ORG_ADMIN"];

export const EXECUTIVE_DASHBOARD_ROLES: Role[] = [
  "ORG_ADMIN",
  "PROGRAM_MANAGER",
  "STAFF",
  "VIEW_ONLY",
  "AUDITOR",
];

export const FINANCE_DASHBOARD_ROLES: Role[] = [
  "ORG_ADMIN",
  "FINANCE_MANAGER",
  "ACCOUNTANT",
];

export const FUNDRAISING_DASHBOARD_ROLES: Role[] = [
  "ORG_ADMIN",
  "FUNDRAISING_MANAGER",
];

export function canAccessNavItem(
  roles: Role[],
  userRole: Role | undefined,
  organizationType?: OrganizationType,
  requiredOrgTypes?: OrganizationType[],
) {
  if (!userRole) {
    return false;
  }
  if (!roles.includes(userRole)) {
    return false;
  }
  if (requiredOrgTypes && organizationType && !requiredOrgTypes.includes(organizationType)) {
    return false;
  }
  return true;
}

export function canAccessAdmin(userRole?: Role) {
  return userRole != null && ADMIN.includes(userRole);
}

/** Post-login landing. Org users land on task Home; deep dashboards stay under More. */
export function getDefaultDashboardPath(role: Role) {
  switch (role) {
    case "SUPER_ADMIN":
      return "/platform/dashboard";
    default:
      return "/";
  }
}

/** Role-specific analytics overview (linked from Home). */
export function getRoleOverviewPath(role: Role) {
  switch (role) {
    case "SUPER_ADMIN":
      return "/platform/dashboard";
    case "FINANCE_MANAGER":
    case "ACCOUNTANT":
      return "/dashboard/finance";
    case "FUNDRAISING_MANAGER":
      return "/dashboard/fundraising";
    case "ORG_ADMIN":
    case "PROGRAM_MANAGER":
    case "STAFF":
    default:
      return "/dashboard/executive";
  }
}

export function canAccessDashboard(path: string, role?: Role) {
  if (!role || role === "SUPER_ADMIN") {
    return false;
  }
  if (path.startsWith("/dashboard/executive")) {
    return EXECUTIVE_DASHBOARD_ROLES.includes(role);
  }
  if (path.startsWith("/dashboard/finance")) {
    return FINANCE_DASHBOARD_ROLES.includes(role);
  }
  if (path.startsWith("/dashboard/fundraising")) {
    return FUNDRAISING_DASHBOARD_ROLES.includes(role);
  }
  return true;
}
