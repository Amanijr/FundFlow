"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { SidebarNav } from "@/components/layout/sidebar-nav";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/use-auth";
import { getDefaultDashboardPath } from "@/lib/navigation/permissions";
import { useSidebarStore } from "@/stores/sidebar-store";

export function MobileSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const mobileOpen = useSidebarStore((state) => state.mobileOpen);
  const setMobileOpen = useSidebarStore((state) => state.setMobileOpen);
  const closeMobile = useSidebarStore((state) => state.closeMobile);
  const homeHref = user ? getDefaultDashboardPath(user.role) : "/";

  useEffect(() => {
    closeMobile();
  }, [pathname, closeMobile]);

  return (
    <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
      <SheetContent aria-describedby={undefined} className="p-0">
        <div className="flex h-12 items-center border-b border-sidebar-border px-4 pr-12">
          <SheetTitle className="sr-only">Navigation menu</SheetTitle>
          <Link
            href={homeHref}
            onClick={closeMobile}
            className="flex items-center gap-2 font-semibold text-sidebar-foreground"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-sidebar-accent text-xs font-bold text-sidebar-foreground">
              F
            </span>
            <span className="font-nav text-sm tracking-wide">FundFlow</span>
          </Link>
        </div>
        <SidebarNav onNavigate={closeMobile} className="h-[calc(100%-3rem)]" />
      </SheetContent>
    </Sheet>
  );
}
