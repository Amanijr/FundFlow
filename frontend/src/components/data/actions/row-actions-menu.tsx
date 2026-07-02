"use client";

import Link from "next/link";
import { MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export interface RowActionItem {
  label: string;
  href?: string;
  onClick?: () => void;
  variant?: "default" | "destructive";
  hidden?: boolean;
  separatorBefore?: boolean;
}

export interface RowActionsMenuProps {
  items: RowActionItem[];
  className?: string;
  align?: "start" | "end";
}

export function RowActionsMenu({ items, className, align = "end" }: RowActionsMenuProps) {
  const visibleItems = items.filter((item) => !item.hidden);

  if (visibleItems.length === 0) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn("h-8 w-8", className)}
          aria-label="Open row actions"
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align}>
        {visibleItems.map((item, index) => {
          const content = (
            <DropdownMenuItem
              key={`${item.label}-${index}`}
              className={item.variant === "destructive" ? "text-destructive focus:text-destructive" : undefined}
              onClick={item.onClick}
              asChild={Boolean(item.href)}
            >
              {item.href ? <Link href={item.href}>{item.label}</Link> : item.label}
            </DropdownMenuItem>
          );

          if (item.separatorBefore && index > 0) {
            return (
              <div key={`${item.label}-${index}-group`}>
                <DropdownMenuSeparator />
                {content}
              </div>
            );
          }

          return content;
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
