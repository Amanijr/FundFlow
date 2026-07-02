"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { LoadingState } from "@/components/feedback/loading-state";
import { useAuth } from "@/hooks/use-auth";

export function GuestGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, isReady } = useAuth();

  useEffect(() => {
    if (isReady && isAuthenticated) {
      router.replace("/");
    }
  }, [isAuthenticated, isReady, router]);

  if (!isReady || isAuthenticated) {
    return <LoadingState variant="brand" label="Loading…" className="min-h-screen" />;
  }

  return <>{children}</>;
}
