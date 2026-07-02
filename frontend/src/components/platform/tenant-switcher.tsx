"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { EntitySelector } from "@/components/forms/entity-selector";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { listPlatformOrganizations } from "@/lib/api/platform";
import { usePlatformStore } from "@/stores/platform-store";

export function TenantSwitcher() {
  const router = useRouter();
  const { accessToken } = useAuth();
  const selectedOrganizationId = usePlatformStore((state) => state.selectedOrganizationId);
  const selectedOrganizationName = usePlatformStore((state) => state.selectedOrganizationName);
  const setTenantContext = usePlatformStore((state) => state.setTenantContext);
  const clearTenantContext = usePlatformStore((state) => state.clearTenantContext);

  const organizationsQuery = useQuery({
    queryKey: ["platform", "organizations"],
    queryFn: async () => (await listPlatformOrganizations(accessToken!)).data,
    enabled: Boolean(accessToken),
  });

  const options = (organizationsQuery.data ?? []).map((org) => ({
    id: String(org.id),
    label: org.name,
    description: org.active ? org.type.replaceAll("_", " ") : `${org.type.replaceAll("_", " ")} · Inactive`,
  }));

  function handleSelect(orgId: string) {
    if (!orgId) {
      clearTenantContext();
      return;
    }
    const org = organizationsQuery.data?.find((item) => item.id === Number(orgId));
    if (org) {
      setTenantContext(org.id, org.name);
    }
  }

  function openTenantWorkspace() {
    if (selectedOrganizationId) {
      router.push("/dashboard/executive");
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-muted/30 p-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="w-full max-w-md space-y-1">
        <p className="text-sm font-medium">Tenant context</p>
        <p className="text-xs text-muted-foreground">
          Select an organization to open its workspace with <code className="rounded bg-muted px-1">X-Organization-Id</code>.
        </p>
        <EntitySelector
          options={options}
          value={selectedOrganizationId ? String(selectedOrganizationId) : ""}
          onChange={handleSelect}
          placeholder="No tenant selected"
        />
      </div>
      <div className="flex flex-wrap gap-2">
        {selectedOrganizationId && (
          <>
            <Button variant="outline" size="sm" onClick={openTenantWorkspace}>
              Open {selectedOrganizationName ?? "tenant"} workspace
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/platform/dashboard/organizations/${selectedOrganizationId}`}>View tenant</Link>
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
