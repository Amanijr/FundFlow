import type { SessionUser } from "@/types/api";
import type { OrganizationMembership } from "@/types/session";

const MEMBERSHIP_CATALOG: OrganizationMembership[] = [
  {
    organizationId: 1,
    name: "CrossLife Mission Network",
    slug: "crosslife",
    type: "CHURCH",
    role: "FINANCE_MANAGER",
    plan: "PROFESSIONAL",
    fiscalYear: 2026,
    active: true,
    primaryCurrency: "TZS",
    timezone: "Africa/Dar_es_Salaam",
    address: "Plot 12, Ali Hassan Mwinyi Road",
    city: "Dar es Salaam",
    country: "Tanzania",
    registrationNumber: "TZ-REG-104582",
    lastAccessedAt: new Date().toISOString(),
  },
  {
    organizationId: 2,
    name: "Hope Foundation",
    slug: "hope-foundation",
    type: "FOUNDATION",
    role: "FINANCE_MANAGER",
    plan: "PROFESSIONAL",
    fiscalYear: 2026,
    active: true,
    primaryCurrency: "TZS",
    timezone: "Africa/Dar_es_Salaam",
    address: "Sokoine Drive",
    city: "Arusha",
    country: "Tanzania",
    lastAccessedAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
  },
  {
    organizationId: 3,
    name: "Children First NGO",
    slug: "children-first",
    type: "NGO",
    role: "AUDITOR",
    plan: "STARTER",
    fiscalYear: 2026,
    active: true,
    primaryCurrency: "TZS",
    timezone: "Africa/Dar_es_Salaam",
    city: "Mwanza",
    country: "Tanzania",
    lastAccessedAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
  },
];

export function getMembershipsForUser(user: SessionUser | null): OrganizationMembership[] {
  if (!user || user.role === "SUPER_ADMIN") {
    return [];
  }

  if (user.role === "AUDITOR") {
    return MEMBERSHIP_CATALOG.filter((item) => item.organizationId === 3).map((item) => ({
      ...item,
      role: user.role,
    }));
  }

  return MEMBERSHIP_CATALOG.slice(0, 2).map((item) => ({
    ...item,
    role: user.role,
    lastAccessedAt:
      item.organizationId === user.organizationId ? new Date().toISOString() : item.lastAccessedAt,
  }));
}

export function getMembershipById(organizationId: number) {
  return MEMBERSHIP_CATALOG.find((item) => item.organizationId === organizationId);
}

export function membershipToOrganizationProfile(membership: OrganizationMembership) {
  return {
    id: membership.organizationId,
    name: membership.name,
    slug: membership.slug,
    type: membership.type,
    email: undefined,
    phone: undefined,
    address: membership.address,
    city: membership.city,
    country: membership.country,
    active: membership.active,
    createdAt: membership.lastAccessedAt,
  };
}
