"use client";

import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  className?: string;
}

/** Placeholder global search — opens command palette on desktop and mobile. */
export function SearchBar({ className }: SearchBarProps) {
  function openCommandPalette() {
    window.dispatchEvent(new Event("fundflow:open-command-palette"));
  }

  return (
    <div className={cn("hidden min-w-0 flex-1 justify-center px-4 md:flex", className)}>
      <button
        type="button"
        onClick={openCommandPalette}
        className="flex h-8 w-full max-w-md items-center gap-2 rounded-lg border border-border bg-muted/60 px-3 text-sm text-muted-foreground transition-colors hover:border-input hover:bg-muted"
        aria-label="Open global search"
      >
        <Search className="h-4 w-4 shrink-0" />
        <span className="truncate">Search navigation, donors, campaigns…</span>
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
      className="h-8 w-8 text-muted-foreground md:hidden"
      onClick={() => window.dispatchEvent(new Event("fundflow:open-command-palette"))}
      aria-label="Open global search"
    >
      <Search className="h-4 w-4" />
    </Button>
  );
}
