import type { CollectionSessionStatus, CollectionType } from "@/types/collection";
import type { PaymentMethod } from "@/types/finance";

export const COLLECTION_TYPE_LABELS: Record<CollectionType, string> = {
  GENERAL: "General collection",
  EVENT: "Event collection",
  PROJECT: "Project collection",
  SPECIAL_APPEAL: "Special appeal",
};

export const COLLECTION_STATUS_LABELS: Record<CollectionSessionStatus, string> = {
  DRAFT: "Draft",
  COUNTED: "Counted",
  VERIFIED: "Verified",
  DEPOSITED: "Banked",
};

export const COLLECTION_PAYMENT_LABELS: Partial<Record<PaymentMethod, string>> = {
  CASH: "Cash",
  MOBILE_MONEY: "Mobile money",
  BANK_TRANSFER: "Bank transfer",
  CHEQUE: "Cheque",
  CARD: "Card",
};

export function collectionTypeLabel(type: CollectionType) {
  return COLLECTION_TYPE_LABELS[type] ?? type;
}

export function collectionStatusLabel(status: CollectionSessionStatus) {
  return COLLECTION_STATUS_LABELS[status] ?? status;
}

export function collectionPaymentLabel(method?: PaymentMethod) {
  if (!method) return "—";
  return COLLECTION_PAYMENT_LABELS[method] ?? method.replaceAll("_", " ");
}
