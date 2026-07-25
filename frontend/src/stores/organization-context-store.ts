"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface OrganizationContextState {
  activeOrganizationId: number | null;
  lastAccessedAt: Record<number, string>;
  setActiveOrganization: (organizationId: number) => void;
  touchOrganization: (organizationId: number) => void;
  resetOrganizationContext: () => void;
}

export const useOrganizationContextStore = create<OrganizationContextState>()(
  persist(
    (set, get) => ({
      activeOrganizationId: null,
      lastAccessedAt: {},
      setActiveOrganization: (organizationId) =>
        set({
          activeOrganizationId: organizationId,
          lastAccessedAt: {
            ...get().lastAccessedAt,
            [organizationId]: new Date().toISOString(),
          },
        }),
      touchOrganization: (organizationId) =>
        set({
          lastAccessedAt: {
            ...get().lastAccessedAt,
            [organizationId]: new Date().toISOString(),
          },
        }),
      resetOrganizationContext: () => set({ activeOrganizationId: null, lastAccessedAt: {} }),
    }),
    {
      name: "fundflow-org-context",
      partialize: (state) => ({
        activeOrganizationId: state.activeOrganizationId,
        lastAccessedAt: state.lastAccessedAt,
      }),
    },
  ),
);
