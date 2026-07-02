"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface PlatformState {
  selectedOrganizationId: number | null;
  selectedOrganizationName: string | null;
  setTenantContext: (organizationId: number, organizationName: string) => void;
  clearTenantContext: () => void;
}

export const usePlatformStore = create<PlatformState>()(
  persist(
    (set) => ({
      selectedOrganizationId: null,
      selectedOrganizationName: null,
      setTenantContext: (organizationId, organizationName) =>
        set({ selectedOrganizationId: organizationId, selectedOrganizationName: organizationName }),
      clearTenantContext: () => set({ selectedOrganizationId: null, selectedOrganizationName: null }),
    }),
    {
      name: "fundflow-platform",
      partialize: (state) => ({
        selectedOrganizationId: state.selectedOrganizationId,
        selectedOrganizationName: state.selectedOrganizationName,
      }),
    },
  ),
);
