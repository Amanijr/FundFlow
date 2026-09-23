"use client";

import { useMemo } from "react";

import { useAuth } from "@/hooks/use-auth";
import { useOrganization } from "@/hooks/use-organization";
import { navigationGroups } from "@/lib/navigation/navigation";
import { canAccessNavItem } from "@/lib/navigation/permissions";
import { isChurchOrganization } from "@/lib/organization/verticals";
import { useSessionPreferencesStore } from "@/stores/session-preferences-store";
import type { NavGroup, NavItem } from "@/types/navigation";
import type { OrganizationType } from "@/types/api";

const CHURCH_GROUP_ORDER = [
  "main",
  "congregation",
  "giving",
  "finance",
  "workflow",
  "more-communication",
  "administration",
  "developer",
];

function isPrimary(item: NavItem) {
  return (item.priority ?? "primary") === "primary";
}

function shapeGroupsForOrganization(groups: NavGroup[], organizationType?: OrganizationType | null): NavGroup[] {
  const church = isChurchOrganization(organizationType);
  const showDeveloper = process.env.NODE_ENV === "development";

  const visible = groups.flatMap((group) => {
    if (group.id === "developer" && !showDeveloper) {
      return [];
    }

    if (!church) {
      return [group];
    }

    if (group.id === "main") {
      return [
        {
          ...group,
          hideLabel: true,
          items: group.items.filter(
            (item) =>
              item.id !== "executive-dashboard" &&
              item.id !== "finance-dashboard" &&
              item.id !== "fundraising-dashboard",
          ),
        },
      ];
    }

    return [group];
  });

  if (!church) {
    return visible;
  }

  return CHURCH_GROUP_ORDER.flatMap((id) => visible.filter((group) => group.id === id));
}

export function useNavigation() {
  const { user } = useAuth();
  const organizationQuery = useOrganization();
  const simpleMode = useSessionPreferencesStore((state) => state.simpleMode);

  const groups = useMemo<NavGroup[]>(() => {
    const organizationType = organizationQuery.data?.type ?? user?.organizationType;
    const visible = navigationGroups
      .map((group) => ({
        ...group,
        items: group.items.filter((item) =>
          canAccessNavItem(
            item.roles,
            user?.role,
            organizationType,
            item.organizationTypes,
            item.excludeOrganizationTypes,
          ),
        ),
      }))
      .filter((group) => group.items.length > 0);
    return shapeGroupsForOrganization(visible, organizationType);
  }, [organizationQuery.data?.type, user?.organizationType, user?.role]);

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
