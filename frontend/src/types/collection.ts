import type { PaymentMethod } from "@/types/finance";

export type CollectionType =
  | "SERVICE_OFFERING"
  | "EVENT"
  | "DEPARTMENT"
  | "PROJECT"
  | "SPECIAL_APPEAL";

export type CollectionSessionStatus = "DRAFT" | "COUNTED" | "VERIFIED" | "DEPOSITED";

export interface CollectionSessionCreateRequest {
  collectionType: CollectionType;
  title?: string;
  description?: string;
  campaignId?: number;
  location?: string;
  notes?: string;
}

export interface CollectionSessionCountRequest {
  totalAmount: number;
  paymentMethod: PaymentMethod;
  collectedAt: string;
  notes?: string;
}

export interface CollectionSessionResponse {
  id: number;
  organizationId: number;
  collectionType: CollectionType;
  title?: string;
  description?: string;
  totalAmount?: number;
  paymentMethod?: PaymentMethod;
  collectedAt?: string;
  location?: string;
  collectedByUserId?: number;
  verifiedByUserId?: number;
  status: CollectionSessionStatus;
  campaignId?: number;
  campaignName?: string;
  donationId?: number;
  notes?: string;
  createdAt: string;
}

export interface CollectionTypeSummary {
  collectionType: CollectionType;
  totalVerifiedAmount: number;
  verifiedSessionCount: number;
}

export interface CollectionDashboardResponse {
  totalVerifiedAmount: number;
  totalVerifiedSessions: number;
  byCollectionType: CollectionTypeSummary[];
  recentSessions: CollectionSessionResponse[];
}
