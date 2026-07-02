"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { LoadingState } from "@/components/feedback/loading-state";
import { useAuth } from "@/hooks/use-auth";

export function PlatformAuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, isReady, user } = useAuth();

  useEffect(() => {
    if (!isReady) {
      return;
    }
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }
    if (user?.role !== "SUPER_ADMIN") {
      router.replace("/");
    }
  }, [isAuthenticated, isReady, router, user?.role]);

  if (!isReady || !isAuthenticated || user?.role !== "SUPER_ADMIN") {
    return <LoadingState variant="brand" label="Loading platform…" className="min-h-screen" />;
  }

  return <>{children}</>;
}
