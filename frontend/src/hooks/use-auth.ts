"use client";

import { useAuthStore } from "@/stores/auth-store";
import type { AuthResponse, Role } from "@/types/api";

export function useAuth() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);
  const hasHydrated = useAuthStore((s) => s._hasHydrated);
  const rememberMe = useAuthStore((s) => s.rememberMe);
  const setSession = useAuthStore((s) => s.setSession);
  const clearSession = useAuthStore((s) => s.clearSession);

  return {
    accessToken,
    user,
    isAuthenticated: Boolean(accessToken && user),
    isReady: hasHydrated,
    rememberMe,
    setSession: (auth: AuthResponse, remember?: boolean) => setSession(auth, remember),
    clearSession,
  };
}

export function useHasRole(...roles: Role[]) {
  const user = useAuthStore((s) => s.user);
  if (!user) {
    return false;
  }
  return roles.includes(user.role);
}
