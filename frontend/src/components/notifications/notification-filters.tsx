import { NOTIFICATION_CATEGORIES } from "@/lib/notification-categories";
import type { NotificationFilters } from "@/types/notification";
import { cn } from "@/lib/utils";

interface NotificationFiltersBarProps {
  filters: NotificationFilters;
  onChange: (filters: NotificationFilters) => void;
  className?: string;
}

const STATUS_OPTIONS = [
  { value: "all", label: "All" },
  { value: "unread", label: "Unread" },
  { value: "read", label: "Read" },
  { value: "archived", label: "Archived" },
] as const;

export function NotificationFiltersBar({
  filters,
  onChange,
  className,
}: NotificationFiltersBarProps) {
  const activeStatus = filters.status ?? "all";
  const activeCategory = filters.category;

  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {STATUS_OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange({ ...filters, status: option.value })}
          className={cn(
            "rounded-full border px-2.5 py-0.5 text-xs transition-colors",
            activeStatus === option.value
              ? "border-stone-900 bg-stone-900 text-white"
              : "border-border bg-background text-muted-foreground hover:text-foreground",
          )}
        >
          {option.label}
        </button>
      ))}
      {NOTIFICATION_CATEGORIES.slice(0, 4).map((category) => (
        <button
          key={category.value}
          type="button"
          onClick={() =>
            onChange({
              ...filters,
              category: activeCategory === category.value ? undefined : category.value,
            })
          }
          className={cn(
            "rounded-full border px-2.5 py-0.5 text-xs transition-colors",
            activeCategory === category.value
              ? "border-stone-900 bg-stone-900 text-white"
              : "border-border bg-background text-muted-foreground hover:text-foreground",
          )}
        >
          {category.label}
        </button>
      ))}
    </div>
  );
}
