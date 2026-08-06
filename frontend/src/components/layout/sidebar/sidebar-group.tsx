"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import type { LucideIcon } from "lucide-react";

import { SidebarItem } from "./sidebar-item";
import { cn } from "@/lib/utils";

export interface SidebarGroupItem {
  href: string;
  label: string;
  icon: LucideIcon;
  active?: boolean;
}

export interface SidebarGroupProps {
  label: string;
  items: SidebarGroupItem[];
  collapsed?: boolean;
  defaultCollapsed?: boolean;
  collapsible?: boolean;
  onNavigate?: () => void;
  className?: string;
}

export function SidebarGroup({
  label,
  items,
  collapsed = false,
  defaultCollapsed = false,
  collapsible = false,
  onNavigate,
  className,
}: SidebarGroupProps) {
  const [open, setOpen] = useState(!defaultCollapsed);
  const showItems = !collapsible || open || collapsed;

  return (
    <div className={className}>
      {!collapsed && (
        <div className="mb-1 flex items-center justify-between gap-2 px-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          {collapsible && (
            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              className="rounded p-0.5 text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
              aria-expanded={open}
              aria-label={open ? `Collapse ${label}` : `Expand ${label}`}
            >
              <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", !open && "-rotate-90")} />
            </button>
          )}
        </div>
      )}
      {collapsed && <div className="mb-1 h-px bg-sidebar-border" aria-hidden />}
      {showItems && (
        <ul className="space-y-0.5">
          {items.map((item) => (
            <SidebarItem
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              active={item.active}
              collapsed={collapsed}
              onNavigate={onNavigate}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
