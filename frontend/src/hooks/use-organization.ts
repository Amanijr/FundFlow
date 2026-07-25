"use client";

import { useQuery } from "@tanstack/react-query";

import { getCurrentOrganization } from "@/lib/api/organization";
import { useApiContext } from "@/hooks/use-api-context";

export function useOrganization() {
  const { token, organizationId, isSuperAdmin } = useApiContext();

  return useQuery({
    queryKey: ["organization", "me", organizationId],
    queryFn: async () => {
      const response = await getCurrentOrganization(token!, organizationId);
      return response.data;
    },
    enabled: Boolean(token) && (!isSuperAdmin || organizationId != null),
  });
}
