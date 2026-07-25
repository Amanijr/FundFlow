import { apiRequest } from "@/lib/api/client";
import type { DonorDetailResponse, DonorRequest, DonorResponse } from "@/types/fundraising";

export function listDonors(token: string) {
  return apiRequest<DonorResponse[]>("/api/v1/donors", { token });
}

export function getDonor(token: string, id: number) {
  return apiRequest<DonorDetailResponse>(`/api/v1/donors/${id}`, { token });
}

export function createDonor(token: string, body: DonorRequest) {
  return apiRequest<DonorResponse>("/api/v1/donors", { method: "POST", token, body });
}

export function updateDonor(token: string, id: number, body: DonorRequest) {
  return apiRequest<DonorResponse>(`/api/v1/donors/${id}`, { method: "PUT", token, body });
}

export function deleteDonor(token: string, id: number) {
  return apiRequest<void>(`/api/v1/donors/${id}`, { method: "DELETE", token });
}
