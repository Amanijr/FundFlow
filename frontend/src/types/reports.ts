import type { FundType } from "@/types/finance";

export interface ReportLineItem {
  code: string;
  name: string;
  amount: number;
}

export interface IncomeExpenditureResponse {
  fromDate?: string;
  toDate?: string;
  revenueLines: ReportLineItem[];
  expenseLines: ReportLineItem[];
  totalRevenue: number;
  totalExpenses: number;
  netSurplus: number;
}

export interface BalanceSheetResponse {
  asOfDate: string;
  assets: ReportLineItem[];
  liabilities: ReportLineItem[];
  netAssets: ReportLineItem[];
  totalAssets: number;
  totalLiabilities: number;
  totalNetAssets: number;
  totalLiabilitiesAndNetAssets: number;
}

export interface CashFlowResponse {
  fromDate?: string;
  toDate?: string;
  openingCash: number;
  cashInflows: number;
  cashOutflows: number;
  netCashChange: number;
  closingCash: number;
}

export interface FundReportLine {
  fundId: number;
  fundCode: string;
  fundName: string;
  fundType: FundType;
  revenue: number;
  expenses: number;
  netActivity: number;
  operationalBalance: number;
}

export interface FundReportResponse {
  fromDate?: string;
  toDate?: string;
  funds: FundReportLine[];
  totalRevenue: number;
  totalExpenses: number;
  totalNetActivity: number;
}

export interface BudgetReportLine {
  accountCode: string;
  accountName: string;
  budgetAmount: number;
  actualAmount: number;
  variance: number;
}

export interface BudgetReportResponse {
  fromDate?: string;
  toDate?: string;
  lines: BudgetReportLine[];
  totalBudget: number;
  totalActual: number;
  totalVariance: number;
  note?: string;
}

export type FinancialReportType = "income-expenditure" | "balance-sheet" | "cash-flow" | "funds";
