export type AccountType = "ASSET" | "LIABILITY" | "EQUITY" | "REVENUE" | "EXPENSE";

export type JournalSourceType =
  | "DONATION_PAYMENT"
  | "IN_KIND_DONATION"
  | "COLLECTION_PAYMENT"
  | "EXPENSE_PAYMENT";

export interface ChartOfAccountRequest {
  code: string;
  name: string;
  accountType: AccountType;
  description?: string;
  active?: boolean;
}

export interface ChartOfAccountResponse {
  id: number;
  code: string;
  name: string;
  accountType: AccountType;
  description?: string;
  active: boolean;
  systemAccount: boolean;
  createdAt: string;
}

export interface JournalLineResponse {
  id: number;
  accountCode: string;
  accountName: string;
  fundId?: number;
  fundName?: string;
  debitAmount: number;
  creditAmount: number;
  lineDescription?: string;
}

export interface JournalEntryResponse {
  id: number;
  entryDate: string;
  description: string;
  sourceType: JournalSourceType;
  sourceId: number;
  postedByUserId?: number;
  fiscalPeriodName?: string;
  totalDebits: number;
  totalCredits: number;
  lines: JournalLineResponse[];
}

export interface GeneralLedgerLine {
  entryDate: string;
  description: string;
  lineDescription?: string;
  debitAmount: number;
  creditAmount: number;
  runningBalance: number;
}

export interface GeneralLedgerResponse {
  accountId: number;
  accountCode: string;
  accountName: string;
  openingBalance: number;
  closingBalance: number;
  lines: GeneralLedgerLine[];
}

export interface TrialBalanceLine {
  accountCode: string;
  accountName: string;
  accountType: AccountType;
  totalDebits: number;
  totalCredits: number;
  balance: number;
}

export interface TrialBalanceResponse {
  totalDebits: number;
  totalCredits: number;
  lines: TrialBalanceLine[];
}
