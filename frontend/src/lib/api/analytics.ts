import { apiRequest } from "@/lib/api/client";
import type {
  ExecutiveDashboardResponse,
  InsightsResponse,
  TrendAnalysisResponse,
} from "@/types/analytics";

interface AnalyticsOptions {
  organizationId?: number;
}

export function getExecutiveDashboard(token: string, from?: string, to?: string, options: AnalyticsOptions = {}) {
  const params = new URLSearchParams();
  if (from) {
    params.set("from", from);
  }
  if (to) {
    params.set("to", to);
  }
  const query = params.toString();
  return apiRequest<ExecutiveDashboardResponse>(
    `/api/v1/analytics/dashboard${query ? `?${query}` : ""}`,
    { token, organizationId: options.organizationId },
  );
}

export function getTrendAnalysis(token: string, from?: string, to?: string, options: AnalyticsOptions = {}) {
  const params = new URLSearchParams();
  if (from) {
    params.set("from", from);
  }
  if (to) {
    params.set("to", to);
  }
  const query = params.toString();
  return apiRequest<TrendAnalysisResponse>(
    `/api/v1/analytics/trends${query ? `?${query}` : ""}`,
    { token, organizationId: options.organizationId },
  );
}

export function getInsights(token: string, options: AnalyticsOptions = {}) {
  return apiRequest<InsightsResponse>("/api/v1/analytics/insights", {
    token,
    organizationId: options.organizationId,
  });
}
