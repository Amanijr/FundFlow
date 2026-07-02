"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { FilterChip, type FilterChipData } from "./filter-chip";
import { SearchInput } from "../search/search-input";

export type { FilterChipData };

export interface FilterBarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filters?: React.ReactNode;
  activeChips?: FilterChipData[];
  onRemoveChip?: (id: string) => void;
  onReset?: () => void;
  className?: string;
}

export function FilterBar({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search...",
  filters,
  activeChips = [],
  onRemoveChip,
  onReset,
  className,
}: FilterBarProps) {
  return (
    <div className={cn("mb-3 space-y-2", className)}>
      <div className="flex flex-col gap-2 rounded-md border border-border bg-muted/20 p-2 lg:flex-row lg:items-center">
        <SearchInput
          value={searchValue}
          onChange={onSearchChange}
          placeholder={searchPlaceholder}
        />
        {filters && <div className="flex flex-wrap items-center gap-1.5">{filters}</div>}
        {onReset && (
          <Button type="button" variant="outline" size="sm" className="h-8 shrink-0 text-xs" onClick={onReset}>
            Reset
          </Button>
        )}
      </div>

      {activeChips.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {activeChips.map((chip) => (
            <FilterChip key={chip.id} chip={chip} onRemove={onRemoveChip} />
          ))}
        </div>
      )}
    </div>
  );
}
