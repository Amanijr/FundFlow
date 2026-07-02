"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { LoadingState } from "@/components/feedback/loading-state";
import { useAuth } from "@/hooks/use-auth";

export default function PlatformIndexPage() {
  const router = useRouter();
  const { isReady, isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (!isReady) {
      return;
    }
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }
    if (user?.role === "SUPER_ADMIN") {
      router.replace("/platform/dashboard");
      return;
    }
    router.replace("/");
  }, [isAuthenticated, isReady, router, user?.role]);

  return <LoadingState className="min-h-screen" />;
}
