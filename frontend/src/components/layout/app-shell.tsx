"use client";

import { useMemo } from "react";

import { CommandPalette } from "@/components/navigation/command-palette";
import { BannerStack } from "@/components/notifications/banner-stack";
import { TenantContextBanner } from "@/components/platform/tenant-context-banner";
import { useAuth } from "@/hooks/use-auth";
import { useOrganization } from "@/hooks/use-organization";
import { buildCommandActions } from "@/lib/navigation/command-actions";

import { ContentContainer } from "./content-container";
import { Footer } from "./footer/footer";
import { Header } from "./header/header";
import { MobileSidebar } from "./mobile-sidebar";
import { Sidebar } from "./sidebar";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { user } = useAuth();
  const organizationQuery = useOrganization();

  const commandActions = useMemo(
    () => buildCommandActions(user?.role, organizationQuery.data?.type),
    [organizationQuery.data?.type, user?.role],
  );

  return (
    <div className="flex min-h-screen bg-background">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-popover focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:text-popover-foreground focus:shadow-md"
      >
        Skip to content
      </a>
      <Sidebar />
      <MobileSidebar />
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <TenantContextBanner />
        <BannerStack />
        <Header />
        <main id="main-content" className="flex min-h-0 flex-1 flex-col overflow-auto">
          <ContentContainer className="flex-1">{children}</ContentContainer>
          <Footer />
        </main>
      </div>
      <CommandPalette actions={commandActions} />
    </div>
  );
}
