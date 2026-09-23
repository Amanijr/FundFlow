"use client";

import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useOrganization } from "@/hooks/use-organization";
import { isChurchOrganization } from "@/lib/organization/verticals";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  className?: string;
}

/** Placeholder global search — opens command palette on desktop and mobile. */
export function SearchBar({ className }: SearchBarProps) {
  const { user } = useAuth();
  const organizationQuery = useOrganization();
  const church = isChurchOrganization(organizationQuery.data?.type ?? user?.organizationType);

  function openCommandPalette() {
    window.dispatchEvent(new Event("fundflow:open-command-palette"));
  }

  return (
    <div className={cn("hidden min-w-0 flex-1 justify-center px-4 md:flex", className)}>
      <button
        type="button"
        onClick={openCommandPalette}
        className="flex h-8 w-full max-w-md items-center gap-2 rounded-lg border border-border bg-surface px-3 text-sm text-muted-foreground transition-colors hover:border-input"
        aria-label="Open global search"
      >
        <Search className="h-4 w-4 shrink-0" />
        <span className="truncate">
          {church
            ? "Search members, collections, giving…"
            : "Search navigation, donors, campaigns…"}
        </span>
        <kbd className="ml-auto hidden rounded border border-border bg-card px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground lg:inline">
          ⌘K
        </kbd>
      </button>
    </div>
  );
}

export function MobileSearchButton() {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-9 w-9"
      onClick={() => window.dispatchEvent(new Event("fundflow:open-command-palette"))}
      aria-label="Open search"
    >
      <Search className="h-4 w-4" />
    </Button>
  );
}
