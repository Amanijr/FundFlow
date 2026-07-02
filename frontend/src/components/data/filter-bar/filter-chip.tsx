import { X } from "lucide-react";

import { cn } from "@/lib/utils";

export interface FilterChipData {
  id: string;
  label: string;
}

export interface FilterChipProps {
  chip: FilterChipData;
  onRemove?: (id: string) => void;
  className?: string;
}

export function FilterChip({ chip, onRemove, className }: FilterChipProps) {
  return (
    <button
      type="button"
      onClick={() => onRemove?.(chip.id)}
      className={cn(
        "inline-flex items-center gap-1 rounded-sm border border-border bg-surface px-2 py-0.5 text-[11px] text-foreground",
        className,
      )}
    >
      {chip.label}
      <X className="h-3 w-3 text-muted-foreground" aria-hidden />
    </button>
  );
}
