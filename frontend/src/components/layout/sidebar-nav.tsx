"use client";

import Link from "next/link";
import { Building2 } from "lucide-react";
import { usePathname } from "next/navigation";

import { SidebarGroup } from "@/components/layout/sidebar/sidebar-group";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useNavigation } from "@/hooks/use-navigation";
import { getDefaultDashboardPath } from "@/lib/navigation/permissions";

function isNavActive(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

interface SidebarNavProps {
  collapsed?: boolean;
  onNavigate?: () => void;
  className?: string;
}

export function SidebarNav({ collapsed = false, onNavigate, className }: SidebarNavProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const { groups, organization } = useNavigation();
  const homeHref = user ? getDefaultDashboardPath(user.role) : "/";

  return (
    <div className={cn("flex min-h-0 flex-1 flex-col", className)}>
      <nav
        className="flex-1 space-y-2 overflow-y-auto overscroll-contain p-4 scrollbar-thin"
        aria-label="Main navigation"
      >
        {groups.map((group) => (
          <SidebarGroup
            key={group.id}
            label={group.label}
            collapsed={collapsed}
            onNavigate={onNavigate}
            items={group.items.map((item) => ({
              href: item.href,
              label: item.label,
              icon: item.icon,
              active: isNavActive(pathname, item.href),
            }))}
          />
        ))}
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
