"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export interface SidebarItemProps {
  href: string;
  label: string;
  icon: LucideIcon;
  active?: boolean;
  collapsed?: boolean;
  onNavigate?: () => void;
}

export function SidebarItem({
  href,
  label,
  icon: Icon,
  active = false,
  collapsed = false,
  onNavigate,
}: SidebarItemProps) {
  return (
    <li>
      <Link
        href={href}
        onClick={onNavigate}
        title={collapsed ? label : undefined}
        aria-current={active ? "page" : undefined}
        className={cn(
          "group flex items-center rounded-[var(--radius-control)] text-sm font-medium transition-colors duration-150",
          collapsed ? "justify-center px-2 py-2" : "px-3 py-2",
          active
            ? "bg-[var(--color-sidebar-active)] text-[var(--color-sidebar-active-foreground)]"
            : "text-sidebar-foreground/75 hover:bg-[var(--color-sidebar-hover)] hover:text-sidebar-foreground",
        )}
      >
        <Icon
          className={cn(
            "h-4 w-4 shrink-0 transition-colors",
            collapsed ? "" : "mr-3",
            active
              ? "text-[var(--brand-cyan)]"
              : "text-[var(--color-status-icon)] group-hover:text-[var(--brand-cyan)]",
          )}
        />
        {!collapsed && <span className="truncate">{label}</span>}
      </Link>
    </li>
  );
}
