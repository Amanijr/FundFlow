"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { InviteUserForm } from "@/components/admin/invite-user-form";
import { OrganizationSettingsForm } from "@/components/admin/organization-settings-form";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useOrganization } from "@/hooks/use-organization";
import { inviteUser } from "@/lib/api/users";
import { updateCurrentOrganization } from "@/lib/api/organization";
import { setOnboardingComplete } from "@/lib/onboarding";
import { getDefaultDashboardPath } from "@/lib/navigation/permissions";
import { ApiError } from "@/types/api";
import type { CreateUserRequest } from "@/lib/api/users";
import type { OrganizationUpdateRequest } from "@/types/admin";
import { cn } from "@/lib/utils";

const steps = ["Profile", "Invite team", "Get started"] as const;

const modules = [
  { href: "/donors", label: "Add donors", description: "Build your donor database" },
  { href: "/campaigns", label: "Create a campaign", description: "Set fundraising goals" },
  { href: "/funds", label: "Set up funds", description: "Configure fund accounting" },
  { href: "/accounting/chart-of-accounts", label: "Initialize accounting", description: "Chart of accounts" },
];

export default function AdminSetupPage() {
  const router = useRouter();
  const { accessToken, user } = useAuth();
  const organizationQuery = useOrganization();
  const [step, setStep] = useState(0);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [inviteError, setInviteError] = useState<string | null>(null);

  async function handleProfileSubmit(values: OrganizationUpdateRequest) {
    setProfileError(null);
    try {
      await updateCurrentOrganization(accessToken!, values);
      toast.success("Profile saved");
      setStep(1);
    } catch (err) {
      setProfileError(err instanceof ApiError ? err.message : "Unable to save profile");
    }
  }

  async function handleInvite(values: CreateUserRequest) {
    setInviteError(null);
    try {
      await inviteUser(accessToken!, values);
      toast.success("Team member invited");
      setStep(2);
    } catch (err) {
      setInviteError(err instanceof ApiError ? err.message : "Unable to invite user");
    }
  }

  function finishSetup() {
    setOnboardingComplete();
    router.replace(user ? getDefaultDashboardPath(user.role) : "/");
  }

  const org = organizationQuery.data;

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <PageHeader
        title="Welcome to FundFlow"
        description="Complete a few steps to set up your organization."
      />

      <ol className="flex items-center gap-2">
        {steps.map((label, index) => (
          <li key={label} className="flex items-center gap-2">
            {index > 0 && <span className="h-px w-6 bg-border" />}
            <span
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium",
                index <= step ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground",
                index === step && "ring-2 ring-primary/30",
              )}
            >
              {label}
            </span>
          </li>
        ))}
      </ol>

      {step === 0 && org && (
        <OrganizationSettingsForm
          serverError={profileError}
          submitLabel="Continue"
          defaultValues={{
            name: org.name,
            type: org.type,
            email: org.email ?? "",
            phone: org.phone ?? "",
            address: org.address ?? "",
            city: org.city ?? "",
            state: org.state ?? "",
            country: org.country ?? "",
          }}
          onSubmit={handleProfileSubmit}
        />
      )}

      {step === 1 && (
        <div className="space-y-4">
          <InviteUserForm
            serverError={inviteError}
            submitLabel="Invite and continue"
            onSubmit={handleInvite}
          />
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setStep(2)}>
              Skip for now
            </Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recommended next steps</CardTitle>
              <CardDescription>Jump into the modules you need most</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              {modules.map((module) => (
                <Link
                  key={module.href}
                  href={module.href}
                  className="rounded-lg border border-border p-4 transition-colors hover:border-primary/40 hover:bg-muted/30"
                >
                  <p className="font-medium text-foreground">{module.label}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{module.description}</p>
                </Link>
              ))}
            </CardContent>
          </Card>
          <div className="flex justify-end">
            <Button onClick={finishSetup}>Go to dashboard</Button>
          </div>
        </div>
      )}
    </div>
  );
}
