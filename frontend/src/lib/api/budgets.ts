import { apiRequest } from "@/lib/api/client";
import type {
  BudgetLineRequest,
  BudgetLineResponse,
  BudgetRequest,
  BudgetResponse,
  BudgetVarianceResponse,
} from "@/types/finance";

export function listBudgets(token: string) {
  return apiRequest<BudgetResponse[]>("/api/v1/budgets", { token });
}

export function getBudget(token: string, id: number) {
  return apiRequest<BudgetResponse>(`/api/v1/budgets/${id}`, { token });
}

export function createBudget(token: string, body: BudgetRequest) {
  return apiRequest<BudgetResponse>("/api/v1/budgets", { method: "POST", token, body });
}

export function updateBudget(token: string, id: number, body: BudgetRequest) {
  return apiRequest<BudgetResponse>(`/api/v1/budgets/${id}`, { method: "PUT", token, body });
}

export function addBudgetLine(token: string, budgetId: number, body: BudgetLineRequest) {
  return apiRequest<BudgetLineResponse>(`/api/v1/budgets/${budgetId}/lines`, {
    method: "POST",
    token,
    body,
  });
}

export function approveBudget(token: string, id: number) {
  return apiRequest<BudgetResponse>(`/api/v1/budgets/${id}/approve`, { method: "POST", token });
}

export function activateBudget(token: string, id: number) {
  return apiRequest<BudgetResponse>(`/api/v1/budgets/${id}/activate`, { method: "POST", token });
}

export function closeBudget(token: string, id: number) {
  return apiRequest<BudgetResponse>(`/api/v1/budgets/${id}/close`, { method: "POST", token });
}

export function getBudgetVariance(token: string, id: number, from?: string, to?: string) {
  const params = new URLSearchParams();
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  const query = params.toString();
  return apiRequest<BudgetVarianceResponse>(
    `/api/v1/budgets/${id}/variance${query ? `?${query}` : ""}`,
    { token },
  );
}
