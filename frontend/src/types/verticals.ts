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
  createdAt: string;
}

export interface AttendanceRecordRequest {
  ministryId?: number;
  serviceDate: string;
  eventName: string;
  attendanceCount: number;
  notes?: string;
}

export interface AttendanceRecordResponse {
  id: number;
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
