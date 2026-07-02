"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { LoadingState } from "@/components/feedback/loading-state";
import { useAuth } from "@/hooks/use-auth";
import { canAccessDashboard, getDefaultDashboardPath } from "@/lib/navigation/permissions";

interface DashboardGuardProps {
  path: string;
  children: React.ReactNode;
}

export function DashboardGuard({ path, children }: DashboardGuardProps) {
  const router = useRouter();
  const { user } = useAuth();
  const allowed = canAccessDashboard(path, user?.role);

  useEffect(() => {
    if (user && !allowed) {
      router.replace(getDefaultDashboardPath(user.role));
    }
  }, [allowed, path, router, user]);

  if (!user || !allowed) {
    return <LoadingState />;
  }

  return <>{children}</>;
}
