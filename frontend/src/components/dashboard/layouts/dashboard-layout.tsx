import type { DashboardConfig } from "../types";
import { DashboardZone } from "./dashboard-zone";

interface DashboardLayoutProps {
  config: DashboardConfig;
}

export function DashboardLayout({ config }: DashboardLayoutProps) {
  return (
    <div className="space-y-5">
      {config.zones.map((zone) => (
        <DashboardZone key={zone.id} zone={zone} />
      ))}
    </div>
  );
}
