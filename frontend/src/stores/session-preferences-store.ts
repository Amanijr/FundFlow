"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { DisplayCurrency, UserPresenceStatus } from "@/types/session";

interface SessionPreferencesState {
  displayCurrency: DisplayCurrency;
  presenceStatus: UserPresenceStatus;
  lastLoginAt: string | null;
  setDisplayCurrency: (currency: DisplayCurrency) => void;
  setPresenceStatus: (status: UserPresenceStatus) => void;
  recordLogin: () => void;
}

export const useSessionPreferencesStore = create<SessionPreferencesState>()(
  persist(
    (set) => ({
      displayCurrency: "TZS",
      presenceStatus: "online",
      lastLoginAt: null,
      setDisplayCurrency: (displayCurrency) => set({ displayCurrency }),
      setPresenceStatus: (presenceStatus) => set({ presenceStatus }),
      recordLogin: () => set({ lastLoginAt: new Date().toISOString() }),
    }),
    {
      name: "fundflow-session-preferences",
      partialize: (state) => ({
        displayCurrency: state.displayCurrency,
        presenceStatus: state.presenceStatus,
        lastLoginAt: state.lastLoginAt,
      }),
    },
  ),
);
