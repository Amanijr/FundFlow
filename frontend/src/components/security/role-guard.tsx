"use client";

import type { Role } from "@/types/api";
import { useHasRole } from "@/hooks/use-auth";

interface RoleGuardProps {
  roles: Role[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function RoleGuard({ roles, children, fallback = null }: RoleGuardProps) {
  const allowed = useHasRole(...roles);
  if (!allowed) {
    return <>{fallback}</>;
  }
  return <>{children}</>;
}
