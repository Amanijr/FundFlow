"use client";

import { PlatformNav } from "@/components/platform/platform-nav";
import { PlatformTopNavigation } from "@/components/platform/platform-top-navigation";
import { TenantSwitcher } from "@/components/platform/tenant-switcher";

interface PlatformShellProps {
  children: React.ReactNode;
}

export function PlatformShell({ children }: PlatformShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PlatformTopNavigation />
      <main className="w-full flex-1 space-y-4 px-4 py-4 sm:px-5">
        <TenantSwitcher />
        <PlatformNav />
        {children}
      </main>
    </div>
  );
}
