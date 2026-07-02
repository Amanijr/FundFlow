"use client";

import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";

import { Breadcrumbs } from "@/components/layout/breadcrumb/breadcrumbs";
import { MobileSearchButton, SearchBar } from "@/components/layout/header/search-bar";
import { UserMenu } from "@/components/layout/header/user-menu";
import { NotificationDropdown } from "@/components/layout/notifications/notification-dropdown";
import { OrganizationSwitcher } from "@/components/layout/organization/organization-switcher";
import { Button } from "@/components/ui/button";
import { buildBreadcrumbs } from "@/lib/navigation/breadcrumbs";
import { useSidebarStore } from "@/stores/sidebar-store";

export function Header() {
  const pathname = usePathname();
  const setMobileOpen = useSidebarStore((state) => state.setMobileOpen);

  const breadcrumbs = buildBreadcrumbs({ pathname });
  const pageTitle = breadcrumbs[breadcrumbs.length - 1]?.label ?? "FundFlow";

  return (
    <header className="sticky top-0 z-40 flex h-12 shrink-0 items-center gap-2 border-b border-border bg-card px-3 sm:px-5">
      <div className="flex min-w-0 flex-1 items-center gap-2 lg:max-w-[40%]">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0 lg:hidden"
          onClick={() => setMobileOpen(true)}
          aria-label="Open navigation menu"
        >
          <Menu className="h-4 w-4" />
        </Button>
        <div className="min-w-0">
          <div className="hidden lg:block">
            <Breadcrumbs items={breadcrumbs} />
          </div>
          <p className="truncate text-sm font-medium text-foreground lg:hidden">{pageTitle}</p>
        </div>
      </div>

      <SearchBar />

      <div className="flex shrink-0 items-center gap-1">
        <MobileSearchButton />
        <NotificationDropdown />
        <OrganizationSwitcher />
        <UserMenu />
      </div>
    </header>
  );
}
