import { GuestGuard } from "@/components/auth/guest-guard";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <GuestGuard>
      <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-8 sm:py-10">
        {children}
      </div>
    </GuestGuard>
  );
}
