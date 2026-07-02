export interface ExecutiveDashboardResponse {
  fromDate: string;
  toDate: string;
  totalDonations: number;
  totalExpenses: number;
  netPosition: number;
  cashBalance: number;
  totalFundBalance: number;
  donationGrowthPercent: number;
  expenseGrowthPercent: number;
  donorCount: number;
  averageDonation: number;
  activeCampaignCount: number;
  budgetUtilizationPercent: number | null;
  pendingExpenseCount: number;
}

export interface TrendPoint {
  period: string;
  amount: number;
  count: number;
}

export interface SourceBreakdown {
  source: string;
  amount: number;
  count: number;
}

export interface CampaignPerformanceLine {
  campaignId: number;
  campaignName: string;
  goalAmount: number;
  raisedAmount: number;
  percentOfGoal: number;
}

export interface TrendAnalysisResponse {
  fromDate: string;
  toDate: string;
  granularity: string;
  donationTrend: TrendPoint[];
  expenseTrend: TrendPoint[];
  donationSources: SourceBreakdown[];
  campaignPerformance: CampaignPerformanceLine[];
}

export type InsightSeverity = "INFO" | "WARNING" | "CRITICAL";

export interface InsightItem {
  category: string;
  severity: InsightSeverity;
  title: string;
  message: string;
}

export interface InsightsResponse {
  insights: InsightItem[];
}
