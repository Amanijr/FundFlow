import { PlatformAuthGuard } from "@/components/auth/platform-auth-guard";
import { PlatformShell } from "@/components/platform/platform-shell";

export default function PlatformDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <PlatformAuthGuard>
      <PlatformShell>{children}</PlatformShell>
    </PlatformAuthGuard>
  );
}
