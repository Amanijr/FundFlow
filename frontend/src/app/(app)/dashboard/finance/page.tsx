import { DashboardGuard } from "@/components/auth/dashboard-guard";
import { FinanceDashboardView } from "@/components/dashboard/finance-dashboard-view";

export default function FinanceDashboardPage() {
  return (
    <DashboardGuard path="/dashboard/finance">
      <FinanceDashboardView />
    </DashboardGuard>
  );
}
