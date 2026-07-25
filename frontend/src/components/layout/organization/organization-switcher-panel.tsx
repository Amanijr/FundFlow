"use client";

import { formatDistanceToNow } from "date-fns";
import { Building2, Check, Plus } from "lucide-react";

import { OrganizationLogo } from "@/components/layout/organization/organization-logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  formatFiscalYear,
  formatOrganizationType,
  formatRoleLabel,
  formatSubscriptionPlan,
} from "@/lib/session/labels";
import { cn } from "@/lib/utils";
import type { OrganizationMembership } from "@/types/session";

interface OrganizationSwitcherPanelProps {
  activeMembership: OrganizationMembership;
  memberships: OrganizationMembership[];
  onSwitch: (organizationId: number) => void;
  onClose?: () => void;
}

function formatLastAccessed(value: string) {
  return formatDistanceToNow(new Date(value), { addSuffix: true });
}

export function OrganizationSwitcherPanel({
  activeMembership,
  memberships,
  onSwitch,
  onClose,
}: OrganizationSwitcherPanelProps) {
  return (
    <div className="content-reveal space-y-4">
      <section className="rounded-lg border border-border bg-surface p-4">
        <div className="flex items-start gap-3">
          <OrganizationLogo name={activeMembership.name} size="lg" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold leading-snug text-foreground">{activeMembership.name}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {formatOrganizationType(activeMembership.type)}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <Badge variant="outline" className="text-[10px] font-medium">
                {formatSubscriptionPlan(activeMembership.plan)}
              </Badge>
              <Badge variant="secondary" className="text-[10px] font-medium">
                {formatFiscalYear(activeMembership.fiscalYear)}
              </Badge>
              <Badge variant={activeMembership.active ? "success" : "secondary"} className="text-[10px] font-medium">
                {activeMembership.active ? "Active" : "Inactive"}
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {memberships.length > 1 && (
        <section className="space-y-1">
          <p className="px-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Switch organization
          </p>
          <ul className="space-y-0.5">
            {memberships.map((membership) => {
              const isActive = membership.organizationId === activeMembership.organizationId;
              return (
                <li key={membership.organizationId}>
                  <button
                    type="button"
                    onClick={() => {
                      if (!isActive) {
                        onSwitch(membership.organizationId);
                      }
                      onClose?.();
                    }}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-md px-2 py-2 text-left transition-colors hover:bg-accent/40",
                      isActive && "bg-accent/30",
                    )}
                  >
                    <OrganizationLogo name={membership.name} size="sm" className="mt-0.5" />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground">{membership.name}</span>
                        {isActive && <Check className="h-3.5 w-3.5 shrink-0 text-foreground" />}
                      </span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        {formatRoleLabel(membership.role)}
                      </span>
                      <span className="mt-0.5 block text-[11px] text-muted-foreground">
                        Last opened {formatLastAccessed(membership.lastAccessedAt)}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <Separator />

      <Button variant="outline" size="sm" className="w-full justify-start gap-2" disabled>
        <Plus className="h-4 w-4" />
        New organization
      </Button>
    </div>
  );
}

export function OrganizationSwitcherCompactTrigger({
  membership,
  className,
}: {
  membership: OrganizationMembership;
  className?: string;
}) {
  return (
    <div className={cn("flex min-w-0 items-center gap-2", className)}>
      <OrganizationLogo name={membership.name} size="sm" />
      <div className="min-w-0 text-left">
        <p className="text-xs font-medium leading-tight text-foreground">{membership.name}</p>
        <p className="text-[10px] leading-tight text-muted-foreground">
          {formatOrganizationType(membership.type)}
        </p>
      </div>
      <Building2 className="ml-1 hidden h-3.5 w-3.5 shrink-0 text-muted-foreground lg:block" />
    </div>
  );
}
