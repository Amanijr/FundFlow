"use client";

import type { LucideIcon } from "lucide-react";

import { SidebarItem } from "./sidebar-item";

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
  onNavigate?: () => void;
  className?: string;
}

export function SidebarGroup({
  label,
  items,
  collapsed = false,
  onNavigate,
  className,
}: SidebarGroupProps) {
  return (
    <div className={className}>
      {!collapsed && (
        <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
      )}
      {collapsed && <div className="mb-1 h-px bg-sidebar-border" aria-hidden />}
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
    </div>
  );
}
