import type { AuthResponse, Role } from "@/types/api";
import type { OrganizationProfile } from "@/types/admin";
import type {
  ExecutiveDashboardResponse,
  InsightsResponse,
  TrendAnalysisResponse,
} from "@/types/analytics";
import type {
  CampaignDashboardResponse,
  CampaignResponse,
  DonationDetailResponse,
  DonationSummaryResponse,
  DonorDetailResponse,
  DonorResponse,
} from "@/types/fundraising";
import type { BudgetResponse, ExpenseResponse, FundResponse } from "@/types/finance";
import type {
  BeneficiaryResponse,
  GrantResponse,
  GrantUtilizationResponse,
  MinistryResponse,
  ProgramDashboardResponse,
  ProgramResponse,
  StudentSponsorshipResponse,
} from "@/types/verticals";

export const MOCK_ORG: OrganizationProfile = {
  id: 1,
  name: "CrossLife Mission Network",
  slug: "crosslife",
  type: "CHURCH",
  email: "karibu@crosslife.org",
  phone: "+255 653 126 583",
  address: "Dar es Salaam",
  city: "Dar es Salaam",
  country: "Tanzania",
  active: true,
  createdAt: "2024-01-15T08:00:00Z",
};

export const MOCK_ORGANIZATIONS: Record<number, OrganizationProfile> = {
  1: MOCK_ORG,
  2: {
    id: 2,
    name: "Hope Foundation",
    slug: "hope-foundation",
    type: "FOUNDATION",
    email: "hello@hopefoundation.org",
    phone: "+255 754 111 222",
    address: "Sokoine Drive",
    city: "Arusha",
    country: "Tanzania",
    active: true,
    createdAt: "2023-06-01T08:00:00Z",
  },
  3: {
    id: 3,
    name: "Children First NGO",
    slug: "children-first",
    type: "NGO",
    email: "info@childrenfirst.org",
    phone: "+255 765 333 444",
    address: "Nyamagana District",
    city: "Mwanza",
    country: "Tanzania",
    active: true,
    createdAt: "2022-11-20T08:00:00Z",
  },
};

export const MOCK_DEMO_PASSWORD = "demo";

export const MOCK_DEMO_USERS: Record<
  string,
  { role: Role; firstName: string; lastName: string; organizationId: number | null }
> = {
  "admin@demo.local": { role: "ORG_ADMIN", firstName: "Grace", lastName: "Admin", organizationId: 1 },
  "finance@demo.local": {
    role: "FINANCE_MANAGER",
    firstName: "David",
    lastName: "Mwangi",
    organizationId: 1,
  },
  "fundraising@demo.local": {
    role: "FUNDRAISING_MANAGER",
    firstName: "Sarah",
    lastName: "Kimaro",
    organizationId: 1,
  },
  "super@demo.local": {
    role: "SUPER_ADMIN",
    firstName: "Platform",
    lastName: "Admin",
    organizationId: null,
  },
};

let nextId = 100;

export function nextMockId(): number {
  nextId += 1;
  return nextId;
}

export function buildAuthResponse(
  email: string,
  role: Role,
  firstName: string,
  lastName: string,
  organizationId: number | null,
  userId = 1,
): AuthResponse {
  return {
    accessToken: `mock-token-${role.toLowerCase()}`,
    tokenType: "Bearer",
    userId,
    organizationId,
    organizationType: organizationId != null ? "CHURCH" : null,
    role,
    email,
    firstName,
    lastName,
  };
}

export const MOCK_DONORS: DonorResponse[] = [
  {
    id: 1,
    organizationId: 1,
    firstName: "James",
    lastName: "Mbeki",
    email: "james.mbeki@example.org",
    phone: "+255 712 345 678",
    city: "Dar es Salaam",
    country: "Tanzania",
    createdAt: "2025-11-10T10:00:00Z",
  },
  {
    id: 2,
    organizationId: 1,
    firstName: "Hope",
    lastName: "Foundation",
    email: "giving@hopefoundation.org",
    phone: "+255 754 111 222",
    city: "Arusha",
    country: "Tanzania",
    createdAt: "2025-12-01T14:30:00Z",
  },
  {
    id: 3,
    organizationId: 1,
    firstName: "Anonymous",
    lastName: "Donor",
    email: "anonymous@example.org",
    phone: "",
    createdAt: "2026-01-20T09:15:00Z",
  },
];

export const MOCK_DONATIONS: DonationSummaryResponse[] = [
  {
    id: 101,
    amount: 250000,
    donationTime: "2026-06-20T10:30:00Z",
    status: "COMPLETED",
    donationType: "ONE_TIME",
    anonymous: false,
    campaignId: 1,
    campaignName: "Building Fund 2026",
  },
  {
    id: 102,
    amount: 50000,
    donationTime: "2026-06-18T15:00:00Z",
    status: "COMPLETED",
    donationType: "ONE_TIME",
    anonymous: true,
    campaignId: 2,
    campaignName: "Youth Discipleship",
  },
  {
    id: 103,
    amount: 120000,
    donationTime: "2026-06-15T11:20:00Z",
    status: "COMPLETED",
    donationType: "RECURRING",
    anonymous: false,
    campaignId: 1,
    campaignName: "Building Fund 2026",
  },
];

export const MOCK_CAMPAIGNS: CampaignResponse[] = [
  {
    id: 1,
    organizationId: 1,
    name: "Building Fund 2026",
    description: "Sanctuary expansion and community centre",
    targetAmount: 5000000,
    startDate: "2026-01-01",
    endDate: "2026-12-31",
    status: "ACTIVE",
    createdAt: "2025-12-15T08:00:00Z",
  },
  {
    id: 2,
    organizationId: 1,
    name: "Youth Discipleship",
    description: "School of Christ youth program",
    targetAmount: 1500000,
    startDate: "2026-03-01",
    endDate: "2026-08-31",
    status: "ACTIVE",
    createdAt: "2026-02-01T08:00:00Z",
  },
];

export const MOCK_FUNDS: FundResponse[] = [
  {
    id: 1,
    organizationId: 1,
    name: "General Fund",
    code: "GEN",
    type: "UNRESTRICTED",
    currentBalance: 8450000,
    active: true,
    createdAt: "2024-01-15T08:00:00Z",
  },
  {
    id: 2,
    organizationId: 1,
    name: "Building Project",
    code: "BLD",
    type: "RESTRICTED",
    description: "Sanctuary expansion",
    currentBalance: 2100000,
    active: true,
    createdAt: "2025-06-01T08:00:00Z",
  },
];

export const MOCK_EXPENSES: ExpenseResponse[] = [
  {
    id: 1,
    organizationId: 1,
    title: "Worship equipment",
    amount: 450000,
    category: "PROGRAM",
    expenseType: "REQUEST",
    fundId: 1,
    fundName: "General Fund",
    status: "APPROVED",
    payeeName: "Sound Solutions TZ",
    department: "Worship",
    createdAt: "2026-06-10T08:00:00Z",
  },
  {
    id: 2,
    organizationId: 1,
    title: "Office supplies",
    amount: 85000,
    category: "ADMINISTRATIVE",
    expenseType: "REIMBURSEMENT",
    fundId: 1,
    fundName: "General Fund",
    status: "SUBMITTED",
    payeeName: "Grace Admin",
    createdAt: "2026-06-22T08:00:00Z",
  },
];

export const MOCK_BUDGETS: BudgetResponse[] = [
  {
    id: 1,
    name: "FY 2026 Operating",
    fiscalYear: 2026,
    startDate: "2026-01-01",
    endDate: "2026-12-31",
    status: "ACTIVE",
    scopeType: "ORGANIZATION",
    totalBudget: 12000000,
    lines: [
      { id: 1, category: "PROGRAM", amount: 6000000, description: "Ministry programs" },
      { id: 2, category: "ADMINISTRATIVE", amount: 3000000 },
      { id: 3, category: "FUNDRAISING", amount: 1500000 },
      { id: 4, category: "OPERATIONS", amount: 1500000 },
    ],
    createdAt: "2025-12-01T08:00:00Z",
  },
];

export const MOCK_PROGRAMS: ProgramResponse[] = [
  {
    id: 1,
    name: "School of Christ",
    code: "SOC",
    description: "Discipleship training",
    status: "ACTIVE",
    startDate: "2026-01-01",
    fundId: 1,
    fundName: "General Fund",
    createdAt: "2025-01-01T08:00:00Z",
  },
  {
    id: 2,
    name: "Kingdom Business Forum",
    code: "KBF",
    status: "ACTIVE",
    fundId: 1,
    fundName: "General Fund",
    createdAt: "2025-03-01T08:00:00Z",
  },
];

export const MOCK_GRANTS: GrantResponse[] = [
  {
    id: 1,
    name: "Community Outreach Grant",
    grantCode: "GRT-2026-01",
    funderName: "East Africa Foundation",
    awardedAmount: 3000000,
    startDate: "2026-01-01",
    endDate: "2026-12-31",
    status: "ACTIVE",
    restrictionType: "PURPOSE_RESTRICTED",
    programId: 1,
    programName: "School of Christ",
    fundId: 2,
    fundName: "Building Project",
    complianceStatus: "COMPLIANT",
    createdAt: "2025-12-01T08:00:00Z",
  },
];

export const MOCK_BENEFICIARIES: BeneficiaryResponse[] = [
  {
    id: 1,
    firstName: "Amina",
    lastName: "Hassan",
    code: "BEN-001",
    beneficiaryType: "STUDENT",
    status: "ACTIVE",
    enrollmentDate: "2026-01-15",
    createdAt: "2026-01-15T08:00:00Z",
  },
];

export const MOCK_MINISTRIES: MinistryResponse[] = [
  {
    id: 1,
    name: "Worship & Chants",
    code: "WOR",
    description: "Weekly worship gatherings",
    leaderName: "Minister of Music",
    active: true,
    createdAt: "2024-06-01T08:00:00Z",
  },
  {
    id: 2,
    name: "Intercessory Prayer",
    code: "PRY",
    description: "Prayer and life community",
    leaderName: "Prayer Coordinator",
    active: true,
    createdAt: "2024-06-01T08:00:00Z",
  },
];

export const MOCK_SPONSORSHIPS: StudentSponsorshipResponse[] = [
  {
    id: 1,
    beneficiaryId: 1,
    beneficiaryName: "Amina Hassan",
    donorId: 2,
    donorName: "Hope Foundation",
    academicYear: "2026",
    term: "Term 1",
    amount: 50000,
    status: "ACTIVE",
    startDate: "2026-01-01",
    createdAt: "2026-01-01T08:00:00Z",
  },
];

export const MOCK_EXECUTIVE_DASHBOARD: ExecutiveDashboardResponse = {
  fromDate: "2026-01-01",
  toDate: "2026-06-30",
  totalDonations: 4850000,
  totalExpenses: 3120000,
  netPosition: 1730000,
  cashBalance: 8450000,
  totalFundBalance: 10550000,
  donationGrowthPercent: 12.5,
  expenseGrowthPercent: 8.2,
  donorCount: 142,
  averageDonation: 34154,
  activeCampaignCount: 2,
  budgetUtilizationPercent: 68.4,
  pendingExpenseCount: 3,
};

export const MOCK_TRENDS: TrendAnalysisResponse = {
  fromDate: "2026-01-01",
  toDate: "2026-06-30",
  granularity: "MONTH",
  donationTrend: [
    { period: "Jan", amount: 620000, count: 18 },
    { period: "Feb", amount: 710000, count: 22 },
    { period: "Mar", amount: 680000, count: 19 },
    { period: "Apr", amount: 820000, count: 25 },
    { period: "May", amount: 790000, count: 24 },
    { period: "Jun", amount: 1230000, count: 34 },
  ],
  expenseTrend: [
    { period: "Jan", amount: 480000, count: 8 },
    { period: "Feb", amount: 520000, count: 9 },
    { period: "Mar", amount: 490000, count: 7 },
    { period: "Apr", amount: 550000, count: 10 },
    { period: "May", amount: 510000, count: 8 },
    { period: "Jun", amount: 570000, count: 11 },
  ],
  donationSources: [
    { source: "Mobile money", amount: 2100000, count: 85 },
    { source: "Bank transfer", amount: 1650000, count: 32 },
    { source: "Cash", amount: 1100000, count: 25 },
  ],
  campaignPerformance: [
    {
      campaignId: 1,
      campaignName: "Building Fund 2026",
      goalAmount: 5000000,
      raisedAmount: 2850000,
      percentOfGoal: 57,
    },
    {
      campaignId: 2,
      campaignName: "Youth Discipleship",
      goalAmount: 1500000,
      raisedAmount: 920000,
      percentOfGoal: 61.3,
    },
  ],
};

export const MOCK_INSIGHTS: InsightsResponse = {
  insights: [
    {
      category: "FUNDRAISING",
      severity: "INFO",
      title: "Strong June giving",
      message: "Donations are up 12.5% compared to the prior period.",
    },
    {
      category: "BUDGET",
      severity: "WARNING",
      title: "Program spend approaching limit",
      message: "Program budget is at 82% utilization with six months remaining.",
    },
    {
      category: "GRANTS",
      severity: "INFO",
      title: "Grant compliance on track",
      message: "Community Outreach Grant is fully compliant.",
    },
  ],
};

export function getDonorDetail(id: number): DonorDetailResponse | undefined {
  const donor = MOCK_DONORS.find((d) => d.id === id);
  if (!donor) return undefined;
  return {
    ...donor,
    lifetimeValue: id === 1 ? 850000 : id === 2 ? 2500000 : 50000,
    donationCount: id === 1 ? 12 : id === 2 ? 8 : 1,
    recentDonations: MOCK_DONATIONS.filter((d) => !d.anonymous || id !== 3).slice(0, 3),
  };
}

export function getDonationDetail(id: number): DonationDetailResponse | undefined {
  const summary = MOCK_DONATIONS.find((d) => d.id === id);
  if (!summary) return undefined;
  return {
    id: summary.id,
    organizationId: 1,
    donorId: summary.anonymous ? undefined : 1,
    donorName: summary.anonymous ? undefined : "James Mbeki",
    amount: summary.amount,
    donationTime: summary.donationTime,
    status: summary.status,
    donationType: summary.donationType,
    anonymous: summary.anonymous,
    campaignId: summary.campaignId,
    campaignName: summary.campaignName,
    source: "Mobile money",
  };
}

export function getCampaignDashboard(id: number): CampaignDashboardResponse | undefined {
  const campaign = MOCK_CAMPAIGNS.find((c) => c.id === id);
  if (!campaign) return undefined;
  const raised = id === 1 ? 2850000 : 920000;
  const target = campaign.targetAmount ?? 0;
  return {
    id: campaign.id,
    name: campaign.name,
    description: campaign.description,
    targetAmount: target,
    raisedAmount: raised,
    remainingAmount: Math.max(0, target - raised),
    goalAchievementPercent: target ? (raised / target) * 100 : 0,
    donationCount: id === 1 ? 45 : 28,
    status: campaign.status,
    startDate: campaign.startDate,
    endDate: campaign.endDate,
    recentDonations: MOCK_DONATIONS.filter((d) => d.campaignId === id),
  };
}

export function getProgramDashboard(id: number): ProgramDashboardResponse | undefined {
  const program = MOCK_PROGRAMS.find((p) => p.id === id);
  if (!program) return undefined;
  return {
    programId: program.id,
    programName: program.name,
    programCode: program.code,
    grantCount: 1,
    activeGrantCount: 1,
    totalAwarded: 3000000,
    totalSpent: 1200000,
    remainingBalance: 1800000,
    activeBudgetId: 1,
    activeBudgetName: "FY 2026 Operating",
    activeBudgetAmount: 6000000,
  };
}

export function getGrantUtilization(id: number): GrantUtilizationResponse | undefined {
  const grant = MOCK_GRANTS.find((g) => g.id === id);
  if (!grant) return undefined;
  return {
    grantId: grant.id,
    grantName: grant.name,
    grantCode: grant.grantCode,
    status: grant.status,
    complianceStatus: grant.complianceStatus,
    awardedAmount: grant.awardedAmount,
    spentAmount: 1200000,
    remainingBalance: grant.awardedAmount - 1200000,
    usagePercent: (1200000 / grant.awardedAmount) * 100,
    endDate: grant.endDate,
    daysToExpiry: 180,
    expiringSoon: false,
  };
}
