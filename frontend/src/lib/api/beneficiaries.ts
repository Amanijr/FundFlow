import { apiRequest } from "@/lib/api/client";
import type { BeneficiaryRequest, BeneficiaryResponse } from "@/types/verticals";

export function listBeneficiaries(token: string) {
  return apiRequest<BeneficiaryResponse[]>("/api/v1/beneficiaries", { token });
}

export function getBeneficiary(token: string, id: number) {
  return apiRequest<BeneficiaryResponse>(`/api/v1/beneficiaries/${id}`, { token });
}

export function createBeneficiary(token: string, body: BeneficiaryRequest) {
  return apiRequest<BeneficiaryResponse>("/api/v1/beneficiaries", { method: "POST", token, body });
}

export function updateBeneficiary(token: string, id: number, body: BeneficiaryRequest) {
  return apiRequest<BeneficiaryResponse>(`/api/v1/beneficiaries/${id}`, { method: "PUT", token, body });
}
