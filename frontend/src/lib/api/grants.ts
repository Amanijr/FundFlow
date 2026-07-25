import { apiRequest } from "@/lib/api/client";
import type { GrantRequest, GrantResponse, GrantUtilizationResponse } from "@/types/verticals";

export function listGrants(token: string) {
  return apiRequest<GrantResponse[]>("/api/v1/grants", { token });
}

export function getGrant(token: string, id: number) {
  return apiRequest<GrantResponse>(`/api/v1/grants/${id}`, { token });
}

export function getGrantUtilization(token: string, id: number) {
  return apiRequest<GrantUtilizationResponse>(`/api/v1/grants/${id}/utilization`, { token });
}

export function createGrant(token: string, body: GrantRequest) {
  return apiRequest<GrantResponse>("/api/v1/grants", { method: "POST", token, body });
}

export function updateGrant(token: string, id: number, body: GrantRequest) {
  return apiRequest<GrantResponse>(`/api/v1/grants/${id}`, { method: "PUT", token, body });
}

export function activateGrant(token: string, id: number) {
  return apiRequest<GrantResponse>(`/api/v1/grants/${id}/activate`, { method: "POST", token });
}

export function closeGrant(token: string, id: number) {
  return apiRequest<GrantResponse>(`/api/v1/grants/${id}/close`, { method: "POST", token });
}
