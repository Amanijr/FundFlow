import type { CollectionSessionStatus, CollectionType } from "@/types/collection";
import type { PaymentMethod } from "@/types/finance";

export const COLLECTION_TYPE_LABELS: Record<CollectionType, string> = {
  SERVICE_OFFERING: "Sunday / service offering",
  EVENT: "Event offering",
  DEPARTMENT: "Ministry collection",
  PROJECT: "Building / project",
  SPECIAL_APPEAL: "Special appeal",
};

export const COLLECTION_STATUS_LABELS: Record<CollectionSessionStatus, string> = {
  DRAFT: "Draft",
  COUNTED: "Counted",
  VERIFIED: "Verified",
  DEPOSITED: "Banked",
};

export const CHURCH_PAYMENT_LABELS: Partial<Record<PaymentMethod, string>> = {
  CASH: "Cash",
  MOBILE_MONEY: "Lipa / M-Pesa",
  BANK_TRANSFER: "Bank",
  CHEQUE: "Cheque",
  CARD: "Card",
};

export function collectionTypeLabel(type: CollectionType) {
  return COLLECTION_TYPE_LABELS[type] ?? type;
}

export function collectionStatusLabel(status: CollectionSessionStatus) {
  return COLLECTION_STATUS_LABELS[status] ?? status;
}

export function churchPaymentLabel(method?: PaymentMethod) {
  if (!method) return "—";
  return CHURCH_PAYMENT_LABELS[method] ?? method.replaceAll("_", " ");
}
