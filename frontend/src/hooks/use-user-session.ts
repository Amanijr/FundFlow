"use client";

import { useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { useEffect, useMemo } from "react";

import { useAuth } from "@/hooks/use-auth";
import { useInboxCount } from "@/hooks/use-workflow";
import { useUnreadNotificationCount } from "@/hooks/use-notifications";
import { useOrganization } from "@/hooks/use-organization";
import { formatRoleLabel } from "@/lib/session/labels";
import { getMembershipsForUser } from "@/lib/session/memberships";
import { useOrganizationContextStore } from "@/stores/organization-context-store";
import { useSessionPreferencesStore } from "@/stores/session-preferences-store";
import type { OrganizationMembership, UserSessionStats } from "@/types/session";

function departmentForRole(role: OrganizationMembership["role"]) {
  switch (role) {
    case "FINANCE_MANAGER":
    case "ACCOUNTANT":
      return "Finance";
    case "FUNDRAISING_MANAGER":
      return "Fundraising";
    case "PROGRAM_MANAGER":
      return "Programs";
    case "AUDITOR":
      return "Audit";
    case "ORG_ADMIN":
      return "Administration";
    default:
      return "Operations";
  }
}

export function useUserSession() {
  const { user } = useAuth();
  const organizationQuery = useOrganization();
  const queryClient = useQueryClient();
  const inboxCountQuery = useInboxCount();
  const unreadQuery = useUnreadNotificationCount();
  const displayCurrency = useSessionPreferencesStore((state) => state.displayCurrency);
  const presenceStatus = useSessionPreferencesStore((state) => state.presenceStatus);
  const lastLoginAt = useSessionPreferencesStore((state) => state.lastLoginAt);
  const setDisplayCurrency = useSessionPreferencesStore((state) => state.setDisplayCurrency);
  const setPresenceStatus = useSessionPreferencesStore((state) => state.setPresenceStatus);

  const activeOrganizationId = useOrganizationContextStore((state) => state.activeOrganizationId);
  const lastAccessedAt = useOrganizationContextStore((state) => state.lastAccessedAt);
  const setActiveOrganization = useOrganizationContextStore((state) => state.setActiveOrganization);

  const memberships = useMemo(
    () => getMembershipsForUser(user, organizationQuery.data),
    [organizationQuery.data, user],
  );

  useEffect(() => {
    if (user?.role === "SUPER_ADMIN") {
      return;
    }
    if (user?.organizationId != null && activeOrganizationId !== user.organizationId) {
      setActiveOrganization(user.organizationId);
    }
  }, [activeOrganizationId, setActiveOrganization, user?.organizationId, user?.role]);

  const activeMembership = useMemo(() => {
    const targetId = activeOrganizationId ?? user?.organizationId ?? memberships[0]?.organizationId;
    const membership = memberships.find((item) => item.organizationId === targetId) ?? memberships[0];
    if (!membership) {
      return null;
    }

    const accessedAt = lastAccessedAt[membership.organizationId] ?? membership.lastAccessedAt;
    return { ...membership, lastAccessedAt: accessedAt };
  }, [activeOrganizationId, lastAccessedAt, memberships, user?.organizationId]);

  const pendingApprovals = inboxCountQuery.data ?? 0;

  const stats: UserSessionStats = {
    pendingApprovals,
    assignedTasks: pendingApprovals > 0 ? Math.min(pendingApprovals + 2, 9) : 2,
    unreadNotifications: unreadQuery.data ?? 0,
    draftRecords: 3,
  };

  function switchOrganization(organizationId: number) {
    setActiveOrganization(organizationId);
    void queryClient.invalidateQueries();
  }

  const lastLoginLabel = lastLoginAt
    ? formatDistanceToNow(new Date(lastLoginAt), { addSuffix: true })
    : "Today";

  return {
    user,
    memberships,
    activeMembership,
    stats,
    displayCurrency,
    presenceStatus,
    professionalTitle: user ? formatRoleLabel(user.role) : "",
    department: activeMembership ? departmentForRole(activeMembership.role) : "",
    lastLoginLabel,
    setDisplayCurrency,
    setPresenceStatus,
    switchOrganization,
    canManageApiKeys: user?.role === "ORG_ADMIN" || user?.role === "FINANCE_MANAGER",
  };
}
