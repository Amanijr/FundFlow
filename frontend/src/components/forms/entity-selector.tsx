"use client";

import { useMemo, useState } from "react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface EntityOption {
  id: string;
  label: string;
  description?: string;
}

interface EntitySelectorProps {
  options: EntityOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  onSearch?: (query: string) => void;
  className?: string;
}

export function EntitySelector({
  options,
  value,
  onChange,
  placeholder = "Search records...",
  onSearch,
  className,
}: EntitySelectorProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return options.filter(
      (option) =>
        option.label.toLowerCase().includes(q) ||
        option.description?.toLowerCase().includes(q),
    );
  }, [options, query]);

  const selected = options.find((option) => option.id === value);

  return (
    <div className={cn("space-y-2", className)}>
      <Input
        value={query}
        placeholder={selected ? selected.label : placeholder}
        onChange={(e) => {
          setQuery(e.target.value);
          onSearch?.(e.target.value);
        }}
      />
      {query && (
        <ul className="max-h-48 overflow-auto rounded-md border border-border bg-surface shadow-sm">
          {filtered.length === 0 ? (
            <li className="px-3 py-2 text-sm text-muted-foreground">No matches</li>
          ) : (
            filtered.map((option) => (
              <li key={option.id}>
                <button
                  type="button"
                  className="flex w-full flex-col px-3 py-2 text-left hover:bg-muted"
                  onClick={() => {
                    onChange?.(option.id);
                    setQuery("");
                  }}
                >
                  <span className="text-sm font-medium">{option.label}</span>
                  {option.description && (
                    <span className="text-xs text-muted-foreground">{option.description}</span>
                  )}
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
