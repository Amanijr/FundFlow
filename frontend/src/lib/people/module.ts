import type { OrganizationType } from "@/types/api";

import { isChurchOrganization } from "@/lib/organization/verticals";

export type PeopleModule = "donors" | "members";

export function peopleModuleForOrganization(type?: OrganizationType | null): PeopleModule {
  return isChurchOrganization(type) ? "members" : "donors";
}

export function peopleBasePath(module: PeopleModule) {
  return module === "members" ? "/members" : "/donors";
}

export function peopleApiBase(module: PeopleModule) {
  return module === "members" ? "/api/v1/members" : "/api/v1/donors";
}

export function peopleListPath(module: PeopleModule) {
  return peopleBasePath(module);
}

export function peopleNewPath(module: PeopleModule) {
  return `${peopleBasePath(module)}/new`;
}

export function personPath(module: PeopleModule, id: number) {
  return `${peopleBasePath(module)}/${id}`;
}

export function personEditPath(module: PeopleModule, id: number) {
  return `${peopleBasePath(module)}/${id}/edit`;
}

export function rewritePeoplePath(pathname: string, organizationType?: OrganizationType | null): string | null {
  const church = isChurchOrganization(organizationType);
  if (church && (pathname === "/donors" || pathname.startsWith("/donors/"))) {
    return pathname.replace(/^\/donors/, "/members");
  }
  if (!church && (pathname === "/members" || pathname.startsWith("/members/"))) {
    return pathname.replace(/^\/members/, "/donors");
  }
  return null;
}
