import { apiRequest } from "@/lib/api/client";
import type {
  ExpensePaymentRequest,
  ExpenseRejectionRequest,
  ExpenseRequest,
  ExpenseResponse,
} from "@/types/finance";

export function listExpenses(token: string) {
  return apiRequest<ExpenseResponse[]>("/api/v1/expenses", { token });
}

export function getExpense(token: string, id: number) {
  return apiRequest<ExpenseResponse>(`/api/v1/expenses/${id}`, { token });
}

export function createExpense(token: string, body: ExpenseRequest) {
  return apiRequest<ExpenseResponse>("/api/v1/expenses", { method: "POST", token, body });
}

export function updateExpense(token: string, id: number, body: ExpenseRequest) {
  return apiRequest<ExpenseResponse>(`/api/v1/expenses/${id}`, { method: "PUT", token, body });
}

export function submitExpense(token: string, id: number) {
  return apiRequest<ExpenseResponse>(`/api/v1/expenses/${id}/submit`, { method: "POST", token });
}

export function approveExpense(token: string, id: number) {
  return apiRequest<ExpenseResponse>(`/api/v1/expenses/${id}/approve`, { method: "POST", token });
}

export function rejectExpense(token: string, id: number, body: ExpenseRejectionRequest) {
  return apiRequest<ExpenseResponse>(`/api/v1/expenses/${id}/reject`, { method: "POST", token, body });
}

export function payExpense(token: string, id: number, body: ExpensePaymentRequest) {
  return apiRequest<ExpenseResponse>(`/api/v1/expenses/${id}/pay`, { method: "POST", token, body });
}

export function reconcileExpense(token: string, id: number) {
  return apiRequest<ExpenseResponse>(`/api/v1/expenses/${id}/reconcile`, { method: "POST", token });
}
