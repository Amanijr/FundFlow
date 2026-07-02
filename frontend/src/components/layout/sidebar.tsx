"use client";

import Link from "next/link";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";

import { SidebarNav } from "@/components/layout/sidebar-nav";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { getDefaultDashboardPath } from "@/lib/navigation/permissions";
import { useSidebarStore } from "@/stores/sidebar-store";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const { user } = useAuth();
  const collapsed = useSidebarStore((state) => state.collapsed);
  const toggleCollapsed = useSidebarStore((state) => state.toggleCollapsed);
  const homeHref = user ? getDefaultDashboardPath(user.role) : "/";

  return (
    <aside
      className={cn(
        "sticky top-0 z-10 hidden h-screen shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-300 lg:flex",
        collapsed ? "w-[3.25rem]" : "w-60",
        className,
      )}
    >
      <div
        className={cn(
          "flex h-12 shrink-0 items-center border-b border-sidebar-border",
          collapsed ? "justify-center px-2" : "justify-between px-2",
        )}
      >
        {!collapsed ? (
          <Link
            href={homeHref}
            className="font-nav flex min-w-0 items-center gap-2 px-2 font-semibold text-sidebar-foreground"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-sidebar-accent text-xs font-bold text-sidebar-foreground">
              F
            </span>
            <span className="truncate text-sm tracking-wide">FundFlow</span>
          </Link>
        ) : (
          <Link
            href={homeHref}
            className="flex h-8 w-8 items-center justify-center rounded-md text-sidebar-foreground hover:bg-sidebar-accent"
            title="FundFlow"
            aria-label="FundFlow home"
          >
            <span className="text-xs font-bold">F</span>
          </Link>
        )}
        {!collapsed && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
            onClick={toggleCollapsed}
            aria-label="Collapse sidebar"
          >
            <PanelLeftClose className="h-4 w-4" />
          </Button>
        )}
      </div>

      {collapsed && (
        <div className="flex justify-center border-b border-sidebar-border py-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
            onClick={toggleCollapsed}
            aria-label="Expand sidebar"
          >
            <PanelLeftOpen className="h-4 w-4" />
          </Button>
        </div>
      )}

      <SidebarNav collapsed={collapsed} />
    </aside>
  );
}
