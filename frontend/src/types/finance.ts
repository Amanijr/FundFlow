export type FundType = "RESTRICTED" | "UNRESTRICTED" | "PROJECT" | "ENDOWMENT";

export type FundTransferStatus = "COMPLETED" | "PENDING" | "FAILED";

export type BudgetStatus = "DRAFT" | "APPROVED" | "ACTIVE" | "CLOSED";

export type BudgetScopeType = "ORGANIZATION" | "DEPARTMENT" | "FUND" | "CAMPAIGN" | "PROGRAM";

export type ExpenseStatus = "DRAFT" | "SUBMITTED" | "APPROVED" | "REJECTED" | "PAID" | "RECONCILED";

export type ExpenseCategory = "OPERATIONS" | "PROGRAM" | "ADMINISTRATIVE" | "FUNDRAISING" | "MISCELLANEOUS";

export type ExpenseType = "REQUEST" | "REIMBURSEMENT";

export type PaymentMethod = "CASH" | "BANK_TRANSFER" | "MOBILE_MONEY" | "CARD" | "CHEQUE";

export interface FundRequest {
  name: string;
  code: string;
  type: FundType;
  description?: string;
  openingBalance?: number;
  active?: boolean;
}

export interface FundResponse {
  id: number;
  organizationId: number;
  name: string;
  code: string;
  type: FundType;
  description?: string;
  openingBalance?: number;
  currentBalance: number;
  active: boolean;
  createdAt: string;
}

export interface FundTransferRequest {
  fromFundId: number;
  toFundId: number;
  amount: number;
  reason?: string;
  transferredAt: string;
}

export interface FundTransferResponse {
  id: number;
  organizationId: number;
  fromFundId: number;
  fromFundName: string;
  toFundId: number;
  toFundName: string;
  amount: number;
  reason?: string;
  transferredAt: string;
  transferredByUserId?: number;
  status: FundTransferStatus;
}

export interface BudgetRequest {
  name: string;
  fiscalYear: number;
  startDate: string;
  endDate: string;
  scopeType: BudgetScopeType;
  department?: string;
  fundId?: number;
  campaignId?: number;
  programId?: number;
}

export interface BudgetLineRequest {
  category: ExpenseCategory;
  department?: string;
  fundId?: number;
  amount: number;
  description?: string;
}

export interface BudgetLineResponse {
  id: number;
  category: ExpenseCategory;
  department?: string;
  fundId?: number;
  fundName?: string;
  amount: number;
  description?: string;
}

export interface BudgetResponse {
  id: number;
  name: string;
  fiscalYear: number;
  startDate: string;
  endDate: string;
  status: BudgetStatus;
  scopeType: BudgetScopeType;
  department?: string;
  fundId?: number;
  fundName?: string;
  campaignId?: number;
  campaignName?: string;
  programId?: number;
  programName?: string;
  totalBudget: number;
  lines: BudgetLineResponse[];
  createdAt: string;
}

export interface BudgetVarianceLine {
  lineId: number;
  category: ExpenseCategory;
  department?: string;
  fundId?: number;
  fundName?: string;
  budgetAmount: number;
  actualAmount: number;
  variance: number;
  utilizationPercent: number;
}

export interface BudgetVarianceResponse {
  budgetId: number;
  budgetName: string;
  status: BudgetStatus;
  scopeType: BudgetScopeType;
  fromDate?: string;
  toDate?: string;
  lines: BudgetVarianceLine[];
  totalBudget: number;
  totalActual: number;
  totalVariance: number;
  utilizationPercent: number;
}

export interface ExpenseRequest {
  title: string;
  description?: string;
  amount: number;
  category: ExpenseCategory;
  expenseType: ExpenseType;
  fundId?: number;
  programId?: number;
  grantId?: number;
  payeeName?: string;
  department?: string;
}

export interface ExpenseResponse {
  id: number;
  organizationId: number;
  title: string;
  description?: string;
  amount: number;
  category: ExpenseCategory;
  expenseType: ExpenseType;
  fundId?: number;
  fundName?: string;
  programId?: number;
  programName?: string;
  grantId?: number;
  grantName?: string;
  status: ExpenseStatus;
  requestedByUserId?: number;
  payeeName?: string;
  department?: string;
  submittedAt?: string;
  approvedByUserId?: number;
  approvedAt?: string;
  rejectionReason?: string;
  paidAt?: string;
  paidByUserId?: number;
  paymentMethod?: PaymentMethod;
  paymentReference?: string;
  reconciledAt?: string;
  reconciledByUserId?: number;
  createdAt: string;
}

export interface ExpensePaymentRequest {
  paymentMethod: PaymentMethod;
  paymentReference: string;
  paidAt: string;
}

export interface ExpenseRejectionRequest {
  reason: string;
}
