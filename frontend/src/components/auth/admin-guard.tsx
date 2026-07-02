"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { LoadingState } from "@/components/feedback/loading-state";
import { useAuth } from "@/hooks/use-auth";

interface AdminGuardProps {
  children: React.ReactNode;
}

export function AdminGuard({ children }: AdminGuardProps) {
  const router = useRouter();
  const { user, isReady } = useAuth();

  useEffect(() => {
    if (isReady && user && user.role !== "ORG_ADMIN") {
      router.replace("/unauthorized");
    }
  }, [isReady, router, user]);

  if (!isReady || !user) {
    return <LoadingState />;
  }

  if (user.role !== "ORG_ADMIN") {
    return <LoadingState />;
  }

  return <>{children}</>;
}
