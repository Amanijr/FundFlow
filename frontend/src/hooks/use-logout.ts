"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { logout as logoutApi } from "@/lib/api/auth";
import { useAuth } from "@/hooks/use-auth";
import { useMfaStore } from "@/stores/mfa-store";

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { accessToken, clearSession } = useAuth();
  const clearMfa = useMfaStore((state) => state.clearChallenge);

  return async function logout(redirectTo = "/login") {
    try {
      if (accessToken) {
        await logoutApi(accessToken);
      }
    } catch {
      // Clear local session even when logout API is unavailable.
    } finally {
      clearSession();
      clearMfa();
      queryClient.clear();
      router.replace(redirectTo);
    }
  };
}
