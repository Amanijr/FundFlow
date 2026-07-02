import { apiRequest } from "@/lib/api/client";
import type { OrganizationProfile, OrganizationUpdateRequest } from "@/types/admin";

export function getCurrentOrganization(token: string, organizationId?: number) {
  return apiRequest<OrganizationProfile>("/api/v1/organizations/me", { token, organizationId });
}

export function updateCurrentOrganization(token: string, body: OrganizationUpdateRequest) {
  return apiRequest<OrganizationProfile>("/api/v1/organizations/me", { method: "PUT", token, body });
}
