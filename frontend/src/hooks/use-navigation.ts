"use client";

import { useMemo } from "react";

import { useAuth } from "@/hooks/use-auth";
import { useOrganization } from "@/hooks/use-organization";
import { navigationGroups } from "@/lib/navigation/navigation";
import { canAccessNavItem } from "@/lib/navigation/permissions";
import type { NavGroup } from "@/types/navigation";

export function useNavigation() {
  const { user } = useAuth();
  const organizationQuery = useOrganization();

  const groups = useMemo<NavGroup[]>(() => {
    const organizationType = organizationQuery.data?.type;
    return navigationGroups
      .map((group) => ({
        ...group,
        items: group.items.filter((item) =>
          canAccessNavItem(item.roles, user?.role, organizationType, item.organizationTypes),
        ),
      }))
      .filter((group) => group.items.length > 0);
  }, [organizationQuery.data?.type, user?.role]);

  return {
    groups,
    organization: organizationQuery.data,
    isLoading: organizationQuery.isLoading,
  };
}
