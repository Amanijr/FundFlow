"use client";

import { Building2, Check, ChevronsUpDown } from "lucide-react";

import { useOrganization } from "@/hooks/use-organization";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/**
 * Organization switcher — displays active org; multi-org switching UI placeholder.
 * Full switching requires backend support and is not wired in this phase.
 */
export function OrganizationSwitcher() {
  const organizationQuery = useOrganization();
  const organization = organizationQuery.data;

  if (!organization) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="hidden h-8 max-w-[11rem] gap-1.5 px-2 text-xs font-normal sm:flex"
          aria-label="Switch organization"
        >
          <Building2 className="h-3.5 w-3.5 shrink-0 text-stone-500" />
          <span className="truncate">{organization.name}</span>
          <ChevronsUpDown className="ml-auto h-3.5 w-3.5 shrink-0 text-stone-400" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Organizations</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled className="flex items-center justify-between">
          <span className="truncate">{organization.name}</span>
          <Check className="h-4 w-4 shrink-0 text-stone-600" />
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled className="text-xs text-muted-foreground">
          Additional organizations coming soon
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
