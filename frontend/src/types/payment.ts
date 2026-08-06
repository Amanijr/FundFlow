export type PaymentMethod = "CASH" | "BANK_TRANSFER" | "MOBILE_MONEY" | "CARD" | "CHEQUE";

export type PaymentChannel = "GATEWAY" | "MANUAL";

export interface GatewayPaymentRequest {
  paymentMethod: PaymentMethod;
  simulateFailure?: boolean;
}

export interface ManualPaymentRequest {
  paymentMethod: PaymentMethod;
  receiptNumber: string;
  collectionDate: string;
  paymentNotes?: string;
}

export interface PaymentResponse {
  paymentId: number;
  donationId: number;
  channel: PaymentChannel;
  paymentMethod: PaymentMethod;
  transactionId?: string;
  receiptNumber?: string;
  recordedByUserId?: number;
  successful: boolean;
  processedAt?: string;
  collectionDate?: string;
  donationStatus: string;
}
