"use client";

import Link from "next/link";
import { useState } from "react";
import { useTheme } from "next-themes";
import { Bell, KeyRound, Moon, Sun } from "lucide-react";

import { DetailCard } from "@/components/display/detail-card";
import { PageHeader } from "@/components/layout/page-header";
import { ProfileForm } from "@/components/settings/profile-form";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/use-auth";
import { useUserSession } from "@/hooks/use-user-session";
import { toast } from "@/hooks/use-toast";
import { updateCurrentUser } from "@/lib/api/auth";
import { ApiError } from "@/types/api";
import { isMockApiEnabled } from "@/lib/mock/config";
import {
  formatOrganizationType,
  formatRoleLabel,
} from "@/lib/session/labels";
import { useSessionPreferencesStore } from "@/stores/session-preferences-store";

export default function ProfileSettingsPage() {
  const { user, accessToken, setUser } = useAuth();
  const { activeMembership, professionalTitle, department, lastLoginLabel } = useUserSession();
  const { resolvedTheme, setTheme } = useTheme();
  const simpleMode = useSessionPreferencesStore((state) => state.simpleMode);
  const setSimpleMode = useSessionPreferencesStore((state) => state.setSimpleMode);
  const [serverError, setServerError] = useState<string | null>(null);

  if (!user) {
    return null;
  }

  const initials = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Settings", href: "/settings/profile" },
          { label: "Profile" },
        ]}
        title="My profile"
        description="Your account details and personal preferences."
      />

      <Card>
        <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="text-base font-semibold">{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1 space-y-1">
            <p className="text-section-heading">
              {user.firstName} {user.lastName}
            </p>
            <p className="truncate text-sm text-muted-foreground">{user.email}</p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <Badge variant="secondary">{formatRoleLabel(user.role)}</Badge>
              {professionalTitle ? <Badge variant="outline">{professionalTitle}</Badge> : null}
              {department ? <Badge variant="outline">{department}</Badge> : null}
            </div>
          </div>
          <p className="text-xs text-muted-foreground sm:text-right">Last login {lastLoginLabel}</p>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <DetailCard
          title="Account"
          fields={[
            { label: "Email", value: user.email },
            { label: "Role", value: formatRoleLabel(user.role) },
            {
              label: "Organization",
              value: activeMembership?.name ?? "—",
            },
            {
              label: "Organization type",
              value: activeMembership
                ? formatOrganizationType(activeMembership.type)
                : user.organizationType
                  ? formatOrganizationType(user.organizationType)
                  : "—",
            },
          ]}
        />
        <DetailCard
          title="Shortcuts"
          fields={[
            {
              label: "Preferences",
              value: (
                <Link href="/settings/notifications" className="text-link hover:underline">
                  Notifications & display
                </Link>
              ),
            },
            {
              label: "Password",
              value: (
                <Link href="/forgot-password" className="text-link hover:underline">
                  Reset via email
                </Link>
              ),
            },
            {
              label: "Approvals",
              value: (
                <Link href="/approvals" className="text-link hover:underline">
                  Open inbox
                </Link>
              ),
            },
          ]}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit profile</CardTitle>
        </CardHeader>
        <CardContent>
          {!isMockApiEnabled() ? (
            <p className="mb-4 text-sm text-muted-foreground">
              Name updates require the live profile API. In demo mode you can edit and save locally.
            </p>
          ) : null}
          <ProfileForm
            user={user}
            serverError={serverError}
            onSubmit={async (values) => {
              setServerError(null);
              if (!accessToken) {
                setServerError("You need to be signed in to update your profile.");
                return;
              }
              try {
                if (isMockApiEnabled()) {
                  const { data: updated } = await updateCurrentUser(accessToken, values);
                  setUser({
                    id: updated.id,
                    email: updated.email,
                    firstName: updated.firstName,
                    lastName: updated.lastName,
                    role: updated.role,
                    organizationId: updated.organizationId,
                    organizationType: updated.organizationType,
                  });
                } else {
                  // Live backend currently exposes GET /auth/me only — persist in session until PUT ships.
                  setUser({
                    ...user,
                    firstName: values.firstName.trim(),
                    lastName: values.lastName.trim(),
                  });
                }
                toast({ title: "Profile saved", variant: "success" });
              } catch (error) {
                const message =
                  error instanceof ApiError ? error.message : "Unable to save profile.";
                setServerError(message);
              }
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <Label htmlFor="profile-simple-mode" className="text-sm font-medium">
                Simple mode
              </Label>
              <p className="text-sm text-muted-foreground">
                Keep navigation focused on day-to-day work.
              </p>
            </div>
            <Switch
              id="profile-simple-mode"
              checked={simpleMode}
              onCheckedChange={setSimpleMode}
              aria-label="Toggle simple mode"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            >
              {resolvedTheme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
              Theme · {resolvedTheme === "dark" ? "Dark" : "Light"}
            </Button>
            <Button type="button" variant="outline" size="sm" asChild>
              <Link href="/settings/notifications">
                <Bell className="h-4 w-4" />
                Notifications
              </Link>
            </Button>
            <Button type="button" variant="outline" size="sm" asChild>
              <Link href="/forgot-password">
                <KeyRound className="h-4 w-4" />
                Reset password
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
