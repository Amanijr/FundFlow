"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { LoadingState } from "@/components/feedback/loading-state";
import { useAuth } from "@/hooks/use-auth";
import { getDefaultDashboardPath } from "@/lib/navigation/permissions";

export default function HomePage() {
  const router = useRouter();
  const { user, isReady } = useAuth();

  useEffect(() => {
    if (!isReady || !user) {
      return;
    }
    router.replace(getDefaultDashboardPath(user.role));
  }, [isReady, router, user]);

  return <LoadingState />;
}
