"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { materialGradientClasses } from "@/lib/utils/material-styles";

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
          "flex items-center rounded-lg text-sm font-normal transition-colors duration-200",
          collapsed ? "justify-center px-2 py-2" : "px-3 py-2",
          active
            ? materialGradientClasses
            : "border border-transparent text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground",
        )}
      >
        <Icon className={cn("h-4 w-4 shrink-0", collapsed ? "" : "mr-3")} />
        {!collapsed && <span className="truncate">{label}</span>}
      </Link>
    </li>
  );
}
