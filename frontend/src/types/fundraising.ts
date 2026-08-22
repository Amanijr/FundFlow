export type CampaignStatus = "DRAFT" | "ACTIVE" | "COMPLETED" | "CANCELLED";

export type DonationStatus = "PENDING" | "COMPLETED" | "FAILED" | "CANCELLED" | "REFUNDED";

export type DonationType = "ONE_TIME" | "RECURRING" | "PLEDGE" | "IN_KIND" | "COLLECTION";

export interface DonorRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
}

export interface DonorResponse {
  id: number;
  organizationId: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  createdAt: string;
}

export interface DonorDetailResponse extends DonorResponse {
  lifetimeValue: number;
  donationCount: number;
  recentDonations: DonationSummaryResponse[];
}

export interface CampaignRequest {
  name: string;
  description?: string;
  targetAmount?: number;
  startDate?: string;
  endDate?: string;
  status?: CampaignStatus;
}

export interface CampaignResponse {
  id: number;
  organizationId: number;
  name: string;
  description?: string;
  targetAmount?: number;
  startDate?: string;
  endDate?: string;
  status: CampaignStatus;
  createdAt: string;
}

export interface CampaignDashboardResponse {
  id: number;
  name: string;
  description?: string;
  targetAmount?: number;
  raisedAmount: number;
  remainingAmount: number;
  goalAchievementPercent: number;
  donationCount: number;
  status: CampaignStatus;
  startDate?: string;
  endDate?: string;
  recentDonations: DonationSummaryResponse[];
}

export interface DonationCreateRequest {
  donorId?: number;
  amount: number;
  donationType: DonationType;
  anonymous?: boolean;
  campaignId?: number;
  fundId?: number;
  pledgeId?: number;
  recurringDonationId?: number;
  source?: string;
  notes?: string;
  itemDescription?: string;
  estimatedValue?: number;
}

export interface DonationSummaryResponse {
  id: number;
  amount: number;
  donationTime: string;
  status: DonationStatus;
  donationType: DonationType;
  anonymous: boolean;
  campaignId?: number;
  campaignName?: string;
}

export interface DonationDetailResponse {
  id: number;
  organizationId: number;
  donorId?: number;
  donorName?: string;
  amount: number;
  donationTime: string;
  status: DonationStatus;
  donationType: DonationType;
  anonymous: boolean;
  campaignId?: number;
  campaignName?: string;
  fundId?: number;
  fundName?: string;
  pledgeId?: number;
  recurringDonationId?: number;
  collectionSessionId?: number;
  collectionType?: string;
  source?: string;
  notes?: string;
  itemDescription?: string;
  estimatedValue?: number;
}

export interface ReceiptResponse {
  donationId: number;
  paymentId?: number;
  receiptNumber: string;
  organizationName: string;
  donorName: string;
  anonymous: boolean;
  amount: number;
  paymentMethod?: string;
  donationTime: string;
  subject: string;
  body: string;
}
