"use client";

import { useQuery } from "@tanstack/react-query";

import { getExecutiveDashboard, getInsights, getTrendAnalysis } from "@/lib/api/analytics";
import { useApiContext } from "@/hooks/use-api-context";

export function useExecutiveDashboard(from?: string, to?: string) {
  const { token, organizationId } = useApiContext();

  return useQuery({
    queryKey: ["analytics", "dashboard", organizationId, from, to],
    queryFn: async () => {
      const response = await getExecutiveDashboard(token!, from, to, { organizationId });
      return response.data;
    },
    enabled: Boolean(token),
  });
}

export function useTrendAnalysis(from?: string, to?: string) {
  const { token, organizationId } = useApiContext();

  return useQuery({
    queryKey: ["analytics", "trends", organizationId, from, to],
    queryFn: async () => {
      const response = await getTrendAnalysis(token!, from, to, { organizationId });
      return response.data;
    },
    enabled: Boolean(token),
  });
}

export function useInsights() {
  const { token, organizationId } = useApiContext();

  return useQuery({
    queryKey: ["analytics", "insights", organizationId],
    queryFn: async () => {
      const response = await getInsights(token!, { organizationId });
      return response.data;
    },
    enabled: Boolean(token),
  });
}
