import type { OrganizationType } from "@/types/api";

export const NGO_ORGANIZATION_TYPES: OrganizationType[] = [
  "NGO",
  "FOUNDATION",
  "CHARITY",
  "COMMUNITY_ORGANIZATION",
];

export const SCHOOL_ORGANIZATION_TYPES: OrganizationType[] = ["SCHOOL"];

export const PROGRAM_ORGANIZATION_TYPES: OrganizationType[] = [
  ...NGO_ORGANIZATION_TYPES,
  ...SCHOOL_ORGANIZATION_TYPES,
];

export function isSchoolOrganization(type?: OrganizationType | null): boolean {
  return type != null && SCHOOL_ORGANIZATION_TYPES.includes(type);
}

export function isNgoOrganization(type?: OrganizationType | null): boolean {
  return type != null && NGO_ORGANIZATION_TYPES.includes(type);
}

/** First matching prefix wins. */
export function requiredOrganizationTypesForPath(pathname: string): OrganizationType[] | null {
  if (pathname === "/school" || pathname.startsWith("/school/")) {
    return SCHOOL_ORGANIZATION_TYPES;
  }
  if (pathname === "/grants" || pathname.startsWith("/grants/")) {
    return NGO_ORGANIZATION_TYPES;
  }
  if (pathname === "/programs" || pathname.startsWith("/programs/")) {
    return PROGRAM_ORGANIZATION_TYPES;
  }
  if (pathname === "/beneficiaries" || pathname.startsWith("/beneficiaries/")) {
    return PROGRAM_ORGANIZATION_TYPES;
  }
  return null;
}
