"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

import { LoadingState } from "@/components/feedback/loading-state";
import { AppShell } from "@/components/layout/app-shell";
import { SessionTimeoutDialog } from "@/components/auth/session-timeout-dialog";
import { useSessionTimeout } from "@/hooks/use-session-timeout";
import { useAuth } from "@/hooks/use-auth";

interface AuthGuardProps {
  children: React.ReactNode;
}

function SessionTimeoutManager() {
  const { open, secondsRemaining, staySignedIn, signOutNow } = useSessionTimeout(true);
  return (
    <SessionTimeoutDialog
      open={open}
      secondsRemaining={secondsRemaining}
      onStaySignedIn={staySignedIn}
      onSignOut={signOutNow}
    />
  );
}

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isReady } = useAuth();

  useEffect(() => {
    if (isReady && !isAuthenticated) {
      const returnUrl = encodeURIComponent(pathname);
      router.replace(`/login?returnUrl=${returnUrl}`);
    }
  }, [isAuthenticated, isReady, pathname, router]);

  if (!isReady) {
    return <LoadingState variant="brand" label="Loading workspace…" className="min-h-screen" />;
  }

  if (!isAuthenticated) {
    return <LoadingState variant="brand" className="min-h-screen" />;
  }

  return (
    <AppShell>
      {children}
      <SessionTimeoutManager />
    </AppShell>
  );
}
