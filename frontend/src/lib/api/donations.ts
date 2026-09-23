import { apiRequest } from "@/lib/api/client";
import type {
  DonationCreateRequest,
  DonationDetailResponse,
  DonationSummaryResponse,
  DonationAuditEventResponse,
  ReceiptResponse,
} from "@/types/fundraising";

export function listDonations(token: string) {
  return apiRequest<DonationSummaryResponse[]>("/api/v1/donations", { token });
}

export function getDonation(token: string, id: number) {
  return apiRequest<DonationDetailResponse>(`/api/v1/donations/${id}`, { token });
}

export function createDonation(token: string, body: DonationCreateRequest) {
  return apiRequest<DonationDetailResponse>("/api/v1/donations", { method: "POST", token, body });
}

export function cancelDonation(token: string, id: number) {
  return apiRequest<DonationDetailResponse>(`/api/v1/donations/${id}/cancel`, {
    method: "POST",
    token,
  });
}

export function voidDonation(token: string, id: number, reason: string) {
  return apiRequest<DonationDetailResponse>(`/api/v1/donations/${id}/void`, {
    method: "POST",
    token,
    body: { reason },
  });
}

export function listDonationAuditEvents(token: string, id: number) {
  return apiRequest<DonationAuditEventResponse[]>(`/api/v1/donations/${id}/audit-events`, { token });
}

export function previewReceipt(token: string, donationId: number) {
  return apiRequest<ReceiptResponse>(`/api/v1/communications/receipts/${donationId}`, { token });
}
