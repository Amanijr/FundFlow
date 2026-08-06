import { apiRequest } from "@/lib/api/client";
import type {
  GatewayPaymentRequest,
  ManualPaymentRequest,
  PaymentResponse,
} from "@/types/payment";

export function processGatewayPayment(
  token: string,
  donationId: number,
  body: GatewayPaymentRequest,
) {
  return apiRequest<PaymentResponse>(`/api/v1/donations/${donationId}/payments/gateway`, {
    method: "POST",
    token,
    body,
  });
}

export function recordManualPayment(
  token: string,
  donationId: number,
  body: ManualPaymentRequest,
) {
  return apiRequest<PaymentResponse>(`/api/v1/donations/${donationId}/payments/manual`, {
    method: "POST",
    token,
    body,
  });
}
