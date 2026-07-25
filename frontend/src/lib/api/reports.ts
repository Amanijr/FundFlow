import { apiRequest } from "@/lib/api/client";
import type {
  BalanceSheetResponse,
  BudgetReportResponse,
  CashFlowResponse,
  FundReportResponse,
  IncomeExpenditureResponse,
} from "@/types/reports";

function withDateParams(from?: string, to?: string) {
  const params = new URLSearchParams();
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  const query = params.toString();
  return query ? `?${query}` : "";
}

export function getIncomeExpenditureReport(token: string, from?: string, to?: string) {
  return apiRequest<IncomeExpenditureResponse>(
    `/api/v1/reports/income-expenditure${withDateParams(from, to)}`,
    { token },
  );
}

export function getBalanceSheetReport(token: string, asOf?: string) {
  const params = asOf ? `?asOf=${asOf}` : "";
  return apiRequest<BalanceSheetResponse>(`/api/v1/reports/balance-sheet${params}`, { token });
}

export function getCashFlowReport(token: string, from?: string, to?: string) {
  return apiRequest<CashFlowResponse>(`/api/v1/reports/cash-flow${withDateParams(from, to)}`, { token });
}

export function getFundReport(token: string, from?: string, to?: string, fundId?: number) {
  const params = new URLSearchParams();
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  if (fundId != null) params.set("fundId", String(fundId));
  const query = params.toString();
  return apiRequest<FundReportResponse>(`/api/v1/reports/funds${query ? `?${query}` : ""}`, { token });
}

export function getBudgetReport(token: string, from?: string, to?: string) {
  return apiRequest<BudgetReportResponse>(`/api/v1/reports/budget${withDateParams(from, to)}`, { token });
}
