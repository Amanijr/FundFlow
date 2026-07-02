import { cn } from "@/lib/utils";

import type { DashboardZoneConfig } from "../types";
import { WidgetRenderer } from "../widgets/widget-renderer";

const layoutClasses: Record<NonNullable<DashboardZoneConfig["layout"]>, string> = {
  full: "grid grid-cols-1 gap-3",
  "grid-2": "grid gap-3 lg:grid-cols-2",
  "grid-3": "grid gap-3 md:grid-cols-3",
  "grid-4": "grid gap-3 sm:grid-cols-2 xl:grid-cols-4",
};

interface DashboardZoneProps {
  zone: DashboardZoneConfig;
}

export function DashboardZone({ zone }: DashboardZoneProps) {
  const visibleWidgets = zone.widgets;
  if (visibleWidgets.length === 0) return null;

  const layout = zone.layout ?? "full";

  if (layout === "full" && visibleWidgets.length === 1) {
    return (
      <section aria-label={zone.label ?? zone.id} className="space-y-2">
        <WidgetRenderer definition={visibleWidgets[0]} />
      </section>
    );
  }

  return (
    <section aria-label={zone.label ?? zone.id} className={cn(layoutClasses[layout])}>
      {visibleWidgets.map((widget) => (
        <WidgetRenderer key={widget.id} definition={widget} />
      ))}
    </section>
  );
}
