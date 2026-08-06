"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { DisplayCurrency, UserPresenceStatus } from "@/types/session";

interface SessionPreferencesState {
  displayCurrency: DisplayCurrency;
  presenceStatus: UserPresenceStatus;
  lastLoginAt: string | null;
  simpleMode: boolean;
  lastCampaignId: string | null;
  lastFundId: string | null;
  setDisplayCurrency: (currency: DisplayCurrency) => void;
  setPresenceStatus: (status: UserPresenceStatus) => void;
  setSimpleMode: (simpleMode: boolean) => void;
  setLastCampaignId: (campaignId: string | null) => void;
  setLastFundId: (fundId: string | null) => void;
  recordLogin: () => void;
}

export const useSessionPreferencesStore = create<SessionPreferencesState>()(
  persist(
    (set) => ({
      displayCurrency: "TZS",
      presenceStatus: "online",
      lastLoginAt: null,
      simpleMode: true,
      lastCampaignId: null,
      lastFundId: null,
      setDisplayCurrency: (displayCurrency) => set({ displayCurrency }),
      setPresenceStatus: (presenceStatus) => set({ presenceStatus }),
      setSimpleMode: (simpleMode) => set({ simpleMode }),
      setLastCampaignId: (lastCampaignId) => set({ lastCampaignId }),
      setLastFundId: (lastFundId) => set({ lastFundId }),
      recordLogin: () => set({ lastLoginAt: new Date().toISOString() }),
    }),
    {
      name: "fundflow-session-preferences",
      partialize: (state) => ({
        displayCurrency: state.displayCurrency,
        presenceStatus: state.presenceStatus,
        lastLoginAt: state.lastLoginAt,
        simpleMode: state.simpleMode,
        lastCampaignId: state.lastCampaignId,
        lastFundId: state.lastFundId,
      }),
    },
  ),
);
