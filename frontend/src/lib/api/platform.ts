import { apiRequest } from "@/lib/api/client";
import type { AuthResponse, UserResponse } from "@/types/api";
import type {
  BootstrapSuperAdminRequest,
  CreateSuperAdminRequest,
  LogSearchParams,
  OrganizationStatusRequest,
  PlatformCreateOrganizationRequest,
  PlatformCreateUserRequest,
  PlatformDashboardResponse,
  PlatformOrganization,
  PlatformStatsResponse,
  PlatformUpdateUserRoleRequest,
  PlatformUser,
  PlatformUserStatusRequest,
  SystemLogResponse,
} from "@/types/platform";

const DASHBOARD = "/api/v1/platform/dashboard";

export function getPlatformDashboard(token: string) {
  return apiRequest<PlatformDashboardResponse>(DASHBOARD, { token });
}

export function getPlatformStats(token: string) {
  return apiRequest<PlatformStatsResponse>(`${DASHBOARD}/stats`, { token });
}

export function listPlatformOrganizations(token: string) {
  return apiRequest<PlatformOrganization[]>(`${DASHBOARD}/organizations`, { token });
}

export function createPlatformOrganization(token: string, body: PlatformCreateOrganizationRequest) {
  return apiRequest<PlatformOrganization>(`${DASHBOARD}/organizations`, { method: "POST", token, body });
}

export function getPlatformOrganization(token: string, id: number) {
  return apiRequest<PlatformOrganization>(`${DASHBOARD}/organizations/${id}`, { token });
}

export function updateOrganizationStatus(token: string, id: number, body: OrganizationStatusRequest) {
  return apiRequest<PlatformOrganization>(`${DASHBOARD}/organizations/${id}/status`, {
    method: "PUT",
    token,
    body,
  });
}

export function listPlatformUsers(token: string) {
  return apiRequest<PlatformUser[]>(`${DASHBOARD}/users`, { token });
}

export function createPlatformUser(token: string, body: PlatformCreateUserRequest) {
  return apiRequest<PlatformUser>(`${DASHBOARD}/users`, { method: "POST", token, body });
}

export function getPlatformUser(token: string, id: number) {
  return apiRequest<PlatformUser>(`${DASHBOARD}/users/${id}`, { token });
}

export function updatePlatformUserRole(token: string, id: number, body: PlatformUpdateUserRoleRequest) {
  return apiRequest<PlatformUser>(`${DASHBOARD}/users/${id}/role`, { method: "PUT", token, body });
}

export function updatePlatformUserStatus(token: string, id: number, body: PlatformUserStatusRequest) {
  return apiRequest<PlatformUser>(`${DASHBOARD}/users/${id}/status`, { method: "PUT", token, body });
}

export function createSuperAdmin(token: string, body: CreateSuperAdminRequest) {
  return apiRequest<UserResponse>(`${DASHBOARD}/super-admins`, { method: "POST", token, body });
}

export function searchPlatformLogs(token: string, params: LogSearchParams = {}) {
  const search = new URLSearchParams();
  if (params.type) search.set("type", params.type);
  if (params.severity) search.set("severity", params.severity);
  if (params.category) search.set("category", params.category);
  if (params.organizationId != null) search.set("organizationId", String(params.organizationId));
  if (params.alertsOnly) search.set("alertsOnly", "true");
  if (params.from) search.set("from", params.from);
  if (params.to) search.set("to", params.to);
  const query = search.toString();
  return apiRequest<SystemLogResponse[]>(`${DASHBOARD}/logs${query ? `?${query}` : ""}`, { token });
}

export function getPlatformLog(token: string, id: number) {
  return apiRequest<SystemLogResponse>(`${DASHBOARD}/logs/${id}`, { token });
}

export function resolvePlatformAlert(token: string, id: number) {
  return apiRequest<SystemLogResponse>(`${DASHBOARD}/logs/${id}/resolve`, { method: "PUT", token });
}

export function bootstrapSuperAdmin(bootstrapSecret: string, body: BootstrapSuperAdminRequest) {
  return apiRequest<AuthResponse>("/api/v1/platform/bootstrap", {
    method: "POST",
    body,
    headers: { "X-Platform-Bootstrap-Secret": bootstrapSecret },
  });
}
