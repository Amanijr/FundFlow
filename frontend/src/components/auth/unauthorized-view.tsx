"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { EmptyState } from "@/components/display/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { getDefaultDashboardPath } from "@/lib/navigation/permissions";
import { useAuth } from "@/hooks/use-auth";

export function UnauthorizedView() {
  const router = useRouter();
  const { user } = useAuth();

  return (
    <div className="space-y-4">
      <PageHeader title="Access denied" description="You don't have permission to view this page." />
      <EmptyState
        title="Insufficient permissions"
        description="Contact your organization administrator if you believe you should have access."
        actionLabel="Go to dashboard"
        onAction={() => router.replace(user ? getDefaultDashboardPath(user.role) : "/")}
      />
      <div className="flex justify-center">
        <Button variant="outline" asChild>
          <Link href="/">Return home</Link>
        </Button>
      </div>
    </div>
  );
}
