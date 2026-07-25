"use client";

import { Building2 } from "lucide-react";

import { useOrganization } from "@/hooks/use-organization";
import { cn } from "@/lib/utils";

interface OrgBadgeProps {
  className?: string;
}

/** Displays the active organization name in the header. */
export function OrgBadge({ className }: OrgBadgeProps) {
  const organizationQuery = useOrganization();
  const name = organizationQuery.data?.name;

  if (!name) {
    return null;
  }

  return (
    <div
      className={cn(
        "hidden max-w-[10rem] items-center gap-1.5 truncate rounded-md border border-stone-200 bg-stone-50 px-2 py-1 text-xs text-stone-700 lg:flex",
        className,
      )}
      title={name}
    >
      <Building2 className="h-3.5 w-3.5 shrink-0 text-stone-500" aria-hidden />
      <span className="truncate font-medium">{name}</span>
    </div>
  );
}
