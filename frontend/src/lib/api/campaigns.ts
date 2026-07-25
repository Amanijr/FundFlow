import { apiRequest } from "@/lib/api/client";
import type {
  CampaignDashboardResponse,
  CampaignRequest,
  CampaignResponse,
} from "@/types/fundraising";

export function listCampaigns(token: string) {
  return apiRequest<CampaignResponse[]>("/api/v1/campaigns", { token });
}

export function getCampaign(token: string, id: number) {
  return apiRequest<CampaignResponse>(`/api/v1/campaigns/${id}`, { token });
}

export function getCampaignDashboard(token: string, id: number) {
  return apiRequest<CampaignDashboardResponse>(`/api/v1/campaigns/${id}/dashboard`, { token });
}

export function createCampaign(token: string, body: CampaignRequest) {
  return apiRequest<CampaignResponse>("/api/v1/campaigns", { method: "POST", token, body });
}

export function updateCampaign(token: string, id: number, body: CampaignRequest) {
  return apiRequest<CampaignResponse>(`/api/v1/campaigns/${id}`, { method: "PUT", token, body });
}

export function deleteCampaign(token: string, id: number) {
  return apiRequest<void>(`/api/v1/campaigns/${id}`, { method: "DELETE", token });
}
