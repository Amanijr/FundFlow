"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { LoadingState } from "@/components/feedback/loading-state";
import { useAuth } from "@/hooks/use-auth";
import { isMockApiEnabled } from "@/lib/mock/config";

export function GuestGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { accessToken, isAuthenticated, isReady, clearSession } = useAuth();
  const staleMockSession =
    Boolean(accessToken?.startsWith("mock-token-")) && !isMockApiEnabled();

  useEffect(() => {
    if (!isReady) {
      return;
    }
    if (staleMockSession) {
      clearSession();
      return;
    }
    if (isAuthenticated) {
      router.replace("/");
    }
  }, [clearSession, isAuthenticated, isReady, router, staleMockSession]);

  if (!isReady || (isAuthenticated && !staleMockSession)) {
    return <LoadingState variant="brand" label="Loading…" className="min-h-screen" />;
  }

  return <>{children}</>;
}
