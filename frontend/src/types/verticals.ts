export type ProgramStatus = "PLANNED" | "ACTIVE" | "COMPLETED" | "ON_HOLD";

export type GrantStatus = "DRAFT" | "ACTIVE" | "CLOSED" | "EXPIRED";

export type GrantRestrictionType = "UNRESTRICTED" | "PURPOSE_RESTRICTED" | "TIME_RESTRICTED" | "FULLY_RESTRICTED";

export type GrantComplianceStatus = "PENDING" | "COMPLIANT" | "AT_RISK" | "NON_COMPLIANT";

export type BeneficiaryStatus = "ACTIVE" | "INACTIVE" | "GRADUATED" | "WITHDRAWN";

export type BeneficiaryType = "GENERAL" | "STUDENT";

export type SponsorshipStatus = "ACTIVE" | "COMPLETED" | "CANCELLED";

export interface ProgramRequest {
  name: string;
  code: string;
  description?: string;
  status: ProgramStatus;
  startDate?: string;
  endDate?: string;
  fundId?: number;
}

export interface ProgramResponse {
  id: number;
  name: string;
  code: string;
  description?: string;
  status: ProgramStatus;
  startDate?: string;
  endDate?: string;
  fundId?: number;
  fundName?: string;
  createdAt: string;
}

export interface ProgramDashboardResponse {
  programId: number;
  programName: string;
  programCode: string;
  grantCount: number;
  activeGrantCount: number;
  totalAwarded: number;
  totalSpent: number;
  remainingBalance: number;
  activeBudgetId?: number;
  activeBudgetName?: string;
  activeBudgetAmount?: number;
}

export interface GrantRequest {
  name: string;
  grantCode: string;
  funderName: string;
  awardedAmount: number;
  startDate: string;
  endDate: string;
  restrictionType: GrantRestrictionType;
  restrictionNotes?: string;
  programId?: number;
  fundId?: number;
}

export interface GrantResponse {
  id: number;
  name: string;
  grantCode: string;
  funderName: string;
  awardedAmount: number;
  startDate: string;
  endDate: string;
  status: GrantStatus;
  restrictionType: GrantRestrictionType;
  restrictionNotes?: string;
  complianceStatus?: GrantComplianceStatus;
  complianceNotes?: string;
  programId?: number;
  programName?: string;
  fundId?: number;
  fundName?: string;
  createdAt: string;
}

export interface GrantUtilizationResponse {
  grantId: number;
  grantName: string;
  grantCode: string;
  status: GrantStatus;
  complianceStatus?: GrantComplianceStatus;
  awardedAmount: number;
  spentAmount: number;
  remainingBalance: number;
  usagePercent: number;
  endDate: string;
  daysToExpiry: number;
  expiringSoon: boolean;
}

export interface BeneficiaryRequest {
  firstName: string;
  lastName: string;
  code: string;
  beneficiaryType: BeneficiaryType;
  status: BeneficiaryStatus;
  enrollmentDate?: string;
  notes?: string;
}

export interface BeneficiaryResponse {
  id: number;
  firstName: string;
  lastName: string;
  code: string;
  beneficiaryType: BeneficiaryType;
  status: BeneficiaryStatus;
  enrollmentDate?: string;
  notes?: string;
  createdAt: string;
}

export interface MinistryRequest {
  name: string;
  code: string;
  description?: string;
  leaderName?: string;
  active?: boolean;
}

export interface MinistryResponse {
  id: number;
  name: string;
  code: string;
  description?: string;
  leaderName?: string;
  active: boolean;
  memberCount?: number;
  createdAt: string;
}

export interface MemberMinistryRequest {
  memberId: number;
  role?: string;
  status?: "ACTIVE" | "INACTIVE";
  joinedAt?: string;
}

export interface MemberMinistryResponse {
  id: number;
  memberId: number;
  memberName: string;
  ministryId: number;
  ministryName: string;
  role?: string;
  status: "ACTIVE" | "INACTIVE";
  joinedAt?: string;
  createdAt: string;
}

export interface ServiceEventRequest {
  name: string;
  serviceDate: string;
  startsAt?: string;
  location?: string;
  ministryId?: number;
  notes?: string;
}

export interface ServiceEventResponse {
  id: number;
  name: string;
  serviceDate: string;
  startsAt?: string;
  location?: string;
  ministryId?: number;
  ministryName?: string;
  notes?: string;
  attendanceId?: number;
  attendanceCount?: number | null;
  createdAt: string;
}

export interface AttendanceRecordRequest {
  serviceEventId?: number;
  ministryId?: number;
  serviceDate?: string;
  eventName?: string;
  attendanceCount: number;
  notes?: string;
}

export interface AttendanceRecordResponse {
  id: number;
  serviceEventId?: number;
  ministryId?: number;
  ministryName?: string;
  serviceDate: string;
  eventName: string;
  attendanceCount: number;
  notes?: string;
  recordedByUserId?: number;
  createdAt: string;
}

export interface AttendanceSummaryResponse {
  fromDate?: string;
  toDate?: string;
  totalAttendance: number;
  recordCount: number;
}

export interface ChurchDashboardResponse {
  memberCount: number;
  activeMemberCount: number;
  fundsRemaining: number;
  givingThisYear: number;
  collectionsNeedingAction: number;
  attendanceThisYear: number;
  lastServiceName?: string;
  lastServiceDate?: string;
  lastAttendanceCount?: number | null;
}

export interface MembershipReportResponse {
  total: number;
  active: number;
  inactive: number;
  visitors: number;
}

export type PartnershipStatus = "ACTIVE" | "PAUSED" | "ENDED";

export type PartnershipMonthStatus = "PAID" | "PARTIAL" | "MISSING" | "AHEAD" | "NONE";

export interface PartnershipRequest {
  memberId: number;
  fundId?: number;
  monthlyAmount: number;
  startDate: string;
  endDate?: string;
  status?: PartnershipStatus;
  notes?: string;
}

export interface PartnershipMonthProgress {
  year: number;
  month: number;
  yearMonth: string;
  expected: number;
  received: number;
  status: PartnershipMonthStatus;
}

export interface PartnershipResponse {
  id: number;
  memberId: number;
  memberName: string;
  memberNumber?: string;
  fundId?: number;
  fundName?: string;
  monthlyAmount: number;
  startDate: string;
  endDate?: string;
  status: PartnershipStatus;
  notes?: string;
  createdAt: string;
  thisMonthExpected: number;
  thisMonthReceived: number;
  thisMonthStatus: PartnershipMonthStatus;
  thisYearExpected: number;
  thisYearReceived: number;
  months?: PartnershipMonthProgress[];
}

export interface StudentSponsorshipRequest {
  beneficiaryId: number;
  donorId: number;
  academicYear: string;
  term?: string;
  amount: number;
  status: SponsorshipStatus;
  startDate?: string;
  endDate?: string;
  notes?: string;
}

export interface StudentSponsorshipResponse {
  id: number;
  beneficiaryId: number;
  beneficiaryName: string;
  donorId: number;
  donorName: string;
  academicYear: string;
  term?: string;
  amount: number;
  status: SponsorshipStatus;
  startDate?: string;
  endDate?: string;
  notes?: string;
  createdAt: string;
}
