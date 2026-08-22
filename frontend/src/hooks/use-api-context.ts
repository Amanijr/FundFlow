"use client";

import { useAuth } from "@/hooks/use-auth";
import { usePlatformStore } from "@/stores/platform-store";

export function useApiContext() {
  const { accessToken, user } = useAuth();
  const selectedOrganizationId = usePlatformStore((state) => state.selectedOrganizationId);

  const organizationId =
    user?.role === "SUPER_ADMIN"
      ? selectedOrganizationId ?? undefined
      : user?.organizationId ?? undefined;

  return {
    token: accessToken,
    organizationId,
    isSuperAdmin: user?.role === "SUPER_ADMIN",
  };
}
