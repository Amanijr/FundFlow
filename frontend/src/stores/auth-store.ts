"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { AuthResponse, SessionUser } from "@/types/api";

interface AuthState {
  accessToken: string | null;
  user: SessionUser | null;
  rememberMe: boolean;
  _hasHydrated: boolean;
  setSession: (auth: AuthResponse, rememberMe?: boolean) => void;
  setUser: (user: SessionUser) => void;
  clearSession: () => void;
  setHasHydrated: (value: boolean) => void;
}

function toSessionUser(auth: AuthResponse): SessionUser {
  return {
    id: auth.userId,
    email: auth.email,
    firstName: auth.firstName,
    lastName: auth.lastName,
    role: auth.role,
    organizationId: auth.organizationId,
  };
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      user: null,
      rememberMe: true,
      _hasHydrated: false,
      setSession: (auth, rememberMe = true) =>
        set({
          accessToken: auth.accessToken,
          user: toSessionUser(auth),
          rememberMe,
        }),
      setUser: (user) => set({ user }),
      clearSession: () => set({ accessToken: null, user: null, rememberMe: true }),
      setHasHydrated: (value) => set({ _hasHydrated: value }),
    }),
    {
      name: "fundflow-auth",
      partialize: (state) => ({
        accessToken: state.accessToken,
        user: state.user,
        rememberMe: state.rememberMe,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
