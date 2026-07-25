"use client";

import { useState } from "react";
import { ChevronsUpDown } from "lucide-react";

import {
  OrganizationSwitcherCompactTrigger,
  OrganizationSwitcherPanel,
} from "@/components/layout/organization/organization-switcher-panel";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-media-query";
import { useUserSession } from "@/hooks/use-user-session";
import { cn } from "@/lib/utils";

export function OrganizationSwitcher() {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const { activeMembership, memberships, switchOrganization } = useUserSession();

  if (!activeMembership) {
    return null;
  }

  const panel = (
    <OrganizationSwitcherPanel
      activeMembership={activeMembership}
      memberships={memberships}
      onSwitch={switchOrganization}
      onClose={() => setOpen(false)}
    />
  );

  const trigger = (
    <Button
      variant="outline"
      size="sm"
      className={cn(
        "h-9 max-w-none gap-1.5 border-border bg-surface px-2.5 hover:bg-accent/30",
        "hidden sm:inline-flex",
      )}
      aria-label="Organization menu"
      onClick={isMobile ? () => setOpen(true) : undefined}
    >
      <OrganizationSwitcherCompactTrigger membership={activeMembership} />
      <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
    </Button>
  );

  if (isMobile) {
    return (
      <>
        {trigger}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent
            showClose
            className="inset-y-0 left-auto right-0 w-full max-w-md border-l border-border bg-surface text-foreground"
          >
            <SheetTitle className="mb-4 text-base font-semibold text-foreground">Organization</SheetTitle>
            {panel}
          </SheetContent>
        </Sheet>
      </>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent align="end" className="w-[min(24rem,calc(100vw-2rem))] border border-border bg-surface p-4 shadow-none">
        {panel}
      </PopoverContent>
    </Popover>
  );
}
