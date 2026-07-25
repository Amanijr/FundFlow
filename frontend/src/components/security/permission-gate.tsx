"use client";

import type { Role } from "@/types/api";
import { useAuth } from "@/hooks/use-auth";

interface PermissionGateProps {
  roles?: Role[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function PermissionGate({
  roles,
  children,
  fallback = null,
}: PermissionGateProps) {
  const { user } = useAuth();

  if (!user) {
    return <>{fallback}</>;
  }

  if (roles && !roles.includes(user.role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
