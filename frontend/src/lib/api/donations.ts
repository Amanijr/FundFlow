import { apiRequest } from "@/lib/api/client";
import type {
  DonationCreateRequest,
  DonationDetailResponse,
  DonationSummaryResponse,
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

export function previewReceipt(token: string, donationId: number) {
  return apiRequest<ReceiptResponse>(`/api/v1/communications/receipts/${donationId}`, { token });
}
