"use client";

import Link from "next/link";
import { Building2, ChevronDown } from "lucide-react";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";

import { SidebarGroup } from "@/components/layout/sidebar/sidebar-group";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useNavigation } from "@/hooks/use-navigation";
import { getDefaultDashboardPath } from "@/lib/navigation/permissions";
import type { NavGroup } from "@/types/navigation";

function isNavActive(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

function mapGroupItems(group: NavGroup, pathname: string) {
  return group.items.map((item) => ({
    href: item.href,
    label: item.label,
    icon: item.icon,
    active: isNavActive(pathname, item.href),
  }));
}

interface SidebarNavProps {
  collapsed?: boolean;
  onNavigate?: () => void;
  className?: string;
}

export function SidebarNav({ collapsed = false, onNavigate, className }: SidebarNavProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const { primaryGroups, secondaryGroups, organization } = useNavigation();
  const homeHref = user ? getDefaultDashboardPath(user.role) : "/";
  const [moreOpen, setMoreOpen] = useState(() =>
    secondaryGroups.some((group) =>
      group.items.some((item) => isNavActive(pathname, item.href)),
    ),
  );

  const secondaryHasActive = useMemo(
    () =>
      secondaryGroups.some((group) =>
        group.items.some((item) => isNavActive(pathname, item.href)),
      ),
    [pathname, secondaryGroups],
  );

  const showMore = moreOpen || secondaryHasActive;

  return (
    <div className={cn("flex min-h-0 flex-1 flex-col", className)}>
      <nav
        className="flex-1 space-y-3 overflow-y-auto overscroll-contain p-4 scrollbar-thin"
        aria-label="Main navigation"
      >
        {primaryGroups.map((group) => (
          <SidebarGroup
            key={group.id}
            label={group.label}
            collapsed={collapsed}
            onNavigate={onNavigate}
            items={mapGroupItems(group, pathname)}
          />
        ))}

        {secondaryGroups.length > 0 && (
          <div className="space-y-2 border-t border-sidebar-border pt-3">
            {!collapsed ? (
              <button
                type="button"
                onClick={() => setMoreOpen((value) => !value)}
                className="flex w-full items-center justify-between rounded-md px-3 py-1.5 text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
                aria-expanded={showMore}
              >
                More
                <ChevronDown
                  className={cn("h-3.5 w-3.5 transition-transform", !showMore && "-rotate-90")}
                />
              </button>
            ) : (
              <div className="mb-1 h-px bg-sidebar-border" aria-hidden />
            )}

            {(collapsed || showMore) &&
              secondaryGroups.map((group) => (
                <SidebarGroup
                  key={group.id}
                  label={group.label}
                  collapsed={collapsed}
                  defaultCollapsed={group.defaultCollapsed}
                  collapsible={!collapsed}
                  onNavigate={onNavigate}
                  items={mapGroupItems(group, pathname)}
                />
              ))}
          </div>
        )}
      </nav>

      {user && (
        <div
          className={cn(
            "shrink-0 border-t border-sidebar-border text-[11px] text-muted-foreground",
            collapsed ? "px-2 py-2 text-center" : "px-3 py-2.5",
          )}
        >
          {!collapsed ? (
            <>
              {organization?.name && (
                <p className="truncate text-[10px] uppercase tracking-wide text-muted-foreground">
                  {organization.name}
                </p>
              )}
              <p className="truncate font-medium text-sidebar-foreground">
                {user.firstName} {user.lastName}
              </p>
              <p className="mt-0.5 truncate capitalize">{user.role.replaceAll("_", " ").toLowerCase()}</p>
            </>
          ) : (
            <Link
              href={homeHref}
              onClick={onNavigate}
              className="mx-auto flex h-8 w-8 items-center justify-center rounded-md text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              title="FundFlow home"
              aria-label="FundFlow home"
            >
              <Building2 className="h-4 w-4" />
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
