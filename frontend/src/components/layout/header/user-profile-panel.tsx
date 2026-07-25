"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Activity,
  Bell,
  Building2,
  ChevronDown,
  ChevronUp,
  Coins,
  HelpCircle,
  Keyboard,
  KeyRound,
  LogOut,
  Moon,
  Settings,
  Sun,
  User,
} from "lucide-react";
import { useTheme } from "next-themes";

import { ProfileQuickStats } from "@/components/layout/header/profile-quick-stats";
import { StatusIndicator } from "@/components/layout/header/status-indicator";
import { OrganizationLogo } from "@/components/layout/organization/organization-logo";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useLogout } from "@/hooks/use-logout";
import { useUserSession } from "@/hooks/use-user-session";
import {
  formatFiscalYear,
  formatOrganizationType,
  formatPresenceStatus,
  formatRoleLabel,
} from "@/lib/session/labels";
import { cn } from "@/lib/utils";
import type { UserPresenceStatus } from "@/types/session";

interface UserProfilePanelProps {
  onClose?: () => void;
  onSwitchOrganization?: () => void;
}

function ProfileAction({
  href,
  icon: Icon,
  label,
  onClick,
  disabled,
}: {
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
}) {
  const className =
    "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-foreground transition-colors hover:bg-accent disabled:pointer-events-none disabled:opacity-50";

  if (href && !disabled) {
    return (
      <Link href={href} className={className} onClick={onClick}>
        <Icon className="h-4 w-4 text-muted-foreground" />
        {label}
      </Link>
    );
  }

  return (
    <button type="button" className={className} onClick={onClick} disabled={disabled}>
      <Icon className="h-4 w-4 text-muted-foreground" />
      {label}
    </button>
  );
}

export function UserProfilePanel({ onClose, onSwitchOrganization }: UserProfilePanelProps) {
  const logout = useLogout();
  const { theme, setTheme } = useTheme();
  const [orgDetailsOpen, setOrgDetailsOpen] = useState(false);
  const {
    user,
    activeMembership,
    stats,
    displayCurrency,
    presenceStatus,
    professionalTitle,
    department,
    lastLoginLabel,
    setPresenceStatus,
    canManageApiKeys,
  } = useUserSession();

  if (!user) {
    return null;
  }

  const initials = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  const presenceOptions: UserPresenceStatus[] = ["online", "away", "busy"];

  return (
    <div className="content-reveal space-y-4">
      <section className="rounded-lg border border-border bg-surface p-4">
        <div className="flex items-start gap-3">
          <div className="relative">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="text-sm font-semibold">{initials}</AvatarFallback>
            </Avatar>
            <span
              className={cn(
                "absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-surface",
                presenceStatus === "online" && "bg-success",
                presenceStatus === "away" && "bg-warning",
                presenceStatus === "busy" && "bg-danger",
              )}
              aria-hidden
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-foreground">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-xs text-muted-foreground">{professionalTitle}</p>
            <p className="mt-1 truncate text-xs text-muted-foreground">{user.email}</p>
            <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-muted-foreground">
              <span>{formatRoleLabel(user.role)}</span>
              <span aria-hidden>·</span>
              <span>{department}</span>
            </div>
          </div>
        </div>

        {activeMembership && (
          <div className="mt-3 flex items-center gap-2 rounded-md border border-border px-2.5 py-2">
            <OrganizationLogo name={activeMembership.name} size="sm" />
            <div className="min-w-0">
              <p className="truncate text-xs font-medium text-foreground">{activeMembership.name}</p>
              <p className="text-[11px] text-muted-foreground">
                {[activeMembership.city, activeMembership.country].filter(Boolean).join(", ") ||
                  formatOrganizationType(activeMembership.type)}
              </p>
            </div>
          </div>
        )}

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>Last login {lastLoginLabel}</span>
          <StatusIndicator status={presenceStatus} showLabel />
        </div>
      </section>

      <ProfileQuickStats stats={stats} />

      <section className="space-y-1">
        <p className="px-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Account</p>
        <ProfileAction icon={User} label="My Profile" href="#" disabled onClick={onClose} />
        <ProfileAction icon={Settings} label="Account Settings" href="/admin/settings" onClick={onClose} />
        <ProfileAction icon={Settings} label="Preferences" href="/settings/notifications" onClick={onClose} />
        <ProfileAction icon={Coins} label={`Display Currency · ${displayCurrency}`} href="#" disabled />
        <ProfileAction
          icon={theme === "dark" ? Sun : Moon}
          label="Theme"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        />
        <ProfileAction icon={Bell} label="Notifications" href="/settings/notifications" onClick={onClose} />
        <ProfileAction icon={Keyboard} label="Keyboard Shortcuts" href="#" disabled />
      </section>

      <Separator />

      <section className="space-y-1">
        <p className="px-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Support</p>
        <ProfileAction icon={HelpCircle} label="Help & Support" href="#" disabled />
        {canManageApiKeys && (
          <ProfileAction icon={KeyRound} label="API Keys" href="#" disabled />
        )}
        <ProfileAction icon={Activity} label="Audit Activity" href="/activity" onClick={onClose} />
        <ProfileAction
          icon={Building2}
          label="Switch Organization"
          onClick={() => {
            onSwitchOrganization?.();
            onClose?.();
          }}
        />
      </section>

      {activeMembership && (
        <section className="rounded-lg border border-border">
          <button
            type="button"
            className="flex w-full items-center justify-between px-3 py-2.5 text-left text-sm font-medium text-foreground"
            onClick={() => setOrgDetailsOpen((value) => !value)}
            aria-expanded={orgDetailsOpen}
          >
            Organization information
            {orgDetailsOpen ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
          {orgDetailsOpen && (
            <dl className="space-y-2 border-t border-border px-3 py-3 text-xs">
              <div>
                <dt className="text-muted-foreground">Address</dt>
                <dd className="mt-0.5 text-foreground">
                  {[activeMembership.address, activeMembership.city, activeMembership.country]
                    .filter(Boolean)
                    .join(", ") || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Primary currency</dt>
                <dd className="mt-0.5 text-foreground">{activeMembership.primaryCurrency}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Fiscal year</dt>
                <dd className="mt-0.5 text-foreground">{formatFiscalYear(activeMembership.fiscalYear)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Timezone</dt>
                <dd className="mt-0.5 text-foreground">{activeMembership.timezone.replaceAll("_", " ")}</dd>
              </div>
              {activeMembership.registrationNumber && (
                <div>
                  <dt className="text-muted-foreground">Registration</dt>
                  <dd className="mt-0.5 text-foreground">{activeMembership.registrationNumber}</dd>
                </div>
              )}
            </dl>
          )}
        </section>
      )}

      <section className="space-y-2">
        <p className="px-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Status</p>
        <div className="flex flex-wrap gap-1.5">
          {presenceOptions.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setPresenceStatus(status)}
              className={cn(
                "rounded-full border border-border px-2.5 py-1 text-xs transition-colors hover:bg-accent",
                presenceStatus === status && "border-foreground bg-accent/40 font-medium",
              )}
            >
              {formatPresenceStatus(status)}
            </button>
          ))}
        </div>
      </section>

      <Button
        variant="outline"
        className="w-full justify-start gap-2"
        onClick={() => {
          onClose?.();
          void logout();
        }}
      >
        <LogOut className="h-4 w-4" />
        Sign out
      </Button>
    </div>
  );
}
