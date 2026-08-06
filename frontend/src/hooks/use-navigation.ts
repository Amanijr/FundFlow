"use client";

import { useMemo } from "react";

import { useAuth } from "@/hooks/use-auth";
import { useOrganization } from "@/hooks/use-organization";
import { navigationGroups } from "@/lib/navigation/navigation";
import { canAccessNavItem } from "@/lib/navigation/permissions";
import { useSessionPreferencesStore } from "@/stores/session-preferences-store";
import type { NavGroup, NavItem } from "@/types/navigation";

function isPrimary(item: NavItem) {
  return (item.priority ?? "primary") === "primary";
}

export function useNavigation() {
  const { user } = useAuth();
  const organizationQuery = useOrganization();
  const simpleMode = useSessionPreferencesStore((state) => state.simpleMode);

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

  const primaryGroups = useMemo(
    () =>
      groups
        .map((group) => ({
          ...group,
          items: group.items.filter(isPrimary),
        }))
        .filter((group) => group.items.length > 0),
    [groups],
  );

  const secondaryGroups = useMemo(() => {
    if (simpleMode) {
      return [];
    }
    return groups
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => !isPrimary(item)),
      }))
      .filter((group) => group.items.length > 0);
  }, [groups, simpleMode]);

  return {
    groups,
    primaryGroups,
    secondaryGroups,
    simpleMode,
    organization: organizationQuery.data,
    isLoading: organizationQuery.isLoading,
  };
}
