import { DashboardGuard } from "@/components/auth/dashboard-guard";
import { ExecutiveDashboardView } from "@/components/dashboard/executive-dashboard-view";

export default function ExecutiveDashboardPage() {
  return (
    <DashboardGuard path="/dashboard/executive">
      <ExecutiveDashboardView />
    </DashboardGuard>
  );
}
