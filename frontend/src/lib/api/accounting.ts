import { apiRequest } from "@/lib/api/client";
import type {
  ChartOfAccountRequest,
  ChartOfAccountResponse,
  GeneralLedgerResponse,
  JournalEntryResponse,
  TrialBalanceResponse,
} from "@/types/accounting";

export function initializeAccounting(token: string) {
  return apiRequest<void>("/api/v1/accounting/initialize", { method: "POST", token });
}

export function listChartOfAccounts(token: string) {
  return apiRequest<ChartOfAccountResponse[]>("/api/v1/accounting/chart-of-accounts", { token });
}

export function createChartOfAccount(token: string, body: ChartOfAccountRequest) {
  return apiRequest<ChartOfAccountResponse>("/api/v1/accounting/chart-of-accounts", {
    method: "POST",
    token,
    body,
  });
}

export function listJournalEntries(token: string) {
  return apiRequest<JournalEntryResponse[]>("/api/v1/accounting/journal-entries", { token });
}

export function getJournalEntry(token: string, id: number) {
  return apiRequest<JournalEntryResponse>(`/api/v1/accounting/journal-entries/${id}`, { token });
}

export function getTrialBalance(token: string) {
  return apiRequest<TrialBalanceResponse>("/api/v1/accounting/trial-balance", { token });
}

export function getGeneralLedger(token: string, accountId: number, from?: string, to?: string) {
  const params = new URLSearchParams();
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  const query = params.toString();
  return apiRequest<GeneralLedgerResponse>(
    `/api/v1/accounting/general-ledger/${accountId}${query ? `?${query}` : ""}`,
    { token },
  );
}
