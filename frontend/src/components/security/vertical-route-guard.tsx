"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

import { LoadingState } from "@/components/feedback/loading-state";
import { useAuth } from "@/hooks/use-auth";
import { useOrganization } from "@/hooks/use-organization";
import { requiredOrganizationTypesForPath } from "@/lib/organization/verticals";
import { rewritePeoplePath } from "@/lib/people/module";

export function VerticalRouteGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const organizationQuery = useOrganization();
  const organizationType = organizationQuery.data?.type ?? user?.organizationType ?? null;
  const isDevRoute = pathname === "/dev" || pathname.startsWith("/dev/");
  const requiredTypes = requiredOrganizationTypesForPath(pathname);
  const rewrittenPeoplePath =
    organizationType != null ? rewritePeoplePath(pathname, organizationType) : null;

  useEffect(() => {
    if (isDevRoute && process.env.NODE_ENV !== "development") {
      router.replace("/unauthorized");
      return;
    }
    if (rewrittenPeoplePath) {
      router.replace(rewrittenPeoplePath);
      return;
    }
    if (!requiredTypes) {
      return;
    }
    if (organizationQuery.isLoading && !organizationType) {
      return;
    }
    if (!organizationType || !requiredTypes.includes(organizationType)) {
      router.replace("/unauthorized");
    }
  }, [
    isDevRoute,
    organizationQuery.isLoading,
    organizationType,
    requiredTypes,
    rewrittenPeoplePath,
    router,
  ]);

  if (isDevRoute && process.env.NODE_ENV !== "development") {
    return <LoadingState />;
  }

  if (rewrittenPeoplePath) {
    return <LoadingState />;
  }

  if (!requiredTypes) {
    return <>{children}</>;
  }

  if (organizationQuery.isLoading && !organizationType) {
    return <LoadingState />;
  }

  if (!organizationType || !requiredTypes.includes(organizationType)) {
    return <LoadingState />;
  }

  return <>{children}</>;
}
