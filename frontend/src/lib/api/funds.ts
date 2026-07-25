import { apiRequest } from "@/lib/api/client";
import type {
  FundRequest,
  FundResponse,
  FundTransferRequest,
  FundTransferResponse,
} from "@/types/finance";

export function listFunds(token: string) {
  return apiRequest<FundResponse[]>("/api/v1/funds", { token });
}

export function getFund(token: string, id: number) {
  return apiRequest<FundResponse>(`/api/v1/funds/${id}`, { token });
}

export function createFund(token: string, body: FundRequest) {
  return apiRequest<FundResponse>("/api/v1/funds", { method: "POST", token, body });
}

export function updateFund(token: string, id: number, body: FundRequest) {
  return apiRequest<FundResponse>(`/api/v1/funds/${id}`, { method: "PUT", token, body });
}

export function listFundTransfers(token: string) {
  return apiRequest<FundTransferResponse[]>("/api/v1/funds/transfers", { token });
}

export function transferFunds(token: string, body: FundTransferRequest) {
  return apiRequest<FundTransferResponse>("/api/v1/funds/transfers", { method: "POST", token, body });
}
