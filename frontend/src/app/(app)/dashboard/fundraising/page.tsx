import { DashboardGuard } from "@/components/auth/dashboard-guard";
import { FundraisingDashboardView } from "@/components/dashboard/fundraising-dashboard-view";

export default function FundraisingDashboardPage() {
  return (
    <DashboardGuard path="/dashboard/fundraising">
      <FundraisingDashboardView />
    </DashboardGuard>
  );
}
