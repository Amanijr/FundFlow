"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { usePlatformStore } from "@/stores/platform-store";
import { Button } from "@/components/ui/button";

export function TenantContextBanner() {
  const router = useRouter();
  const selectedOrganizationId = usePlatformStore((state) => state.selectedOrganizationId);
  const selectedOrganizationName = usePlatformStore((state) => state.selectedOrganizationName);
  const clearTenantContext = usePlatformStore((state) => state.clearTenantContext);

  if (!selectedOrganizationId) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2 border-b border-primary/20 bg-primary/5 px-4 py-2 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <p className="text-sm">
        Viewing tenant: <span className="font-medium">{selectedOrganizationName ?? `Org #${selectedOrganizationId}`}</span>
      </p>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/platform/dashboard/organizations/${selectedOrganizationId}`}>Platform view</Link>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            clearTenantContext();
            router.push("/platform/dashboard");
          }}
        >
          Exit tenant context
        </Button>
      </div>
    </div>
  );
}
