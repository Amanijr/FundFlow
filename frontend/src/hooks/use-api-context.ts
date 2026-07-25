"use client";

import { useAuth } from "@/hooks/use-auth";
import { useOrganizationContextStore } from "@/stores/organization-context-store";
import { usePlatformStore } from "@/stores/platform-store";

export function useApiContext() {
  const { accessToken, user } = useAuth();
  const selectedOrganizationId = usePlatformStore((state) => state.selectedOrganizationId);
  const activeOrganizationId = useOrganizationContextStore((state) => state.activeOrganizationId);

  const organizationId =
    user?.role === "SUPER_ADMIN"
      ? selectedOrganizationId ?? undefined
      : activeOrganizationId ?? user?.organizationId ?? undefined;

  return {
    token: accessToken,
    organizationId,
    isSuperAdmin: user?.role === "SUPER_ADMIN",
  };
}
