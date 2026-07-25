"use client";

import { useState } from "react";

import { UserProfilePanel } from "@/components/layout/header/user-profile-panel";
import { OrganizationSwitcherPanel } from "@/components/layout/organization/organization-switcher-panel";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { StatusIndicator } from "@/components/layout/header/status-indicator";
import { useAuth } from "@/hooks/use-auth";
import { useIsMobile } from "@/hooks/use-media-query";
import { useUserSession } from "@/hooks/use-user-session";

type PanelView = "profile" | "organization";

export function UserProfileMenu() {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<PanelView>("profile");
  const { presenceStatus, activeMembership, memberships, switchOrganization } = useUserSession();

  const initials = user
    ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()
    : "?";

  const content =
    view === "organization" && activeMembership ? (
      <OrganizationSwitcherPanel
        activeMembership={activeMembership}
        memberships={memberships}
        onSwitch={switchOrganization}
        onClose={() => {
          setView("profile");
          setOpen(false);
        }}
      />
    ) : (
      <UserProfilePanel
        onClose={() => setOpen(false)}
        onSwitchOrganization={() => setView("organization")}
      />
    );

  const trigger = (
    <Button
      variant="ghost"
      className="h-9 gap-2 rounded-full px-1.5 hover:bg-accent/40"
      aria-label="Open user profile"
      onClick={isMobile ? () => setOpen(true) : undefined}
    >
      <span className="relative">
        <Avatar className="h-8 w-8">
          <AvatarFallback className="text-xs font-semibold">{initials}</AvatarFallback>
        </Avatar>
        <span className="absolute -bottom-0.5 -right-0.5 hidden rounded-full border border-surface bg-surface px-1 py-0.5 sm:block">
          <StatusIndicator status={presenceStatus} />
        </span>
      </span>
    </Button>
  );

  if (isMobile) {
    return (
      <>
        {trigger}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent
            showClose
            className="inset-y-0 left-auto right-0 w-full max-w-md overflow-y-auto border-l border-border bg-surface text-foreground"
          >
            <SheetTitle className="mb-4 text-base font-semibold text-foreground">
              {view === "organization" ? "Switch organization" : "Account"}
            </SheetTitle>
            {content}
          </SheetContent>
        </Sheet>
      </>
    );
  }

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          setView("profile");
        }
      }}
    >
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent
        align="end"
        className="max-h-[min(32rem,calc(100vh-5rem))] w-[min(22rem,calc(100vw-2rem))] overflow-y-auto border border-border bg-surface p-4 shadow-none"
      >
        {content}
      </PopoverContent>
    </Popover>
  );
}
