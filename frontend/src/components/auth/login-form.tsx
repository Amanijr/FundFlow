"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";

import { EmailField, PasswordField } from "@/components/forms";
import { ErrorAlert } from "@/components/feedback/error-alert";
import { SuccessAlert } from "@/components/feedback/success-alert";
import { WarningAlert } from "@/components/feedback/warning-alert";
import { login } from "@/lib/api/auth";
import { mapAuthError } from "@/lib/auth/error-messages";
import { resolvePostLoginPath } from "@/lib/auth/return-url";
import { useAuth } from "@/hooks/use-auth";
import { getDefaultDashboardPath } from "@/lib/navigation/permissions";
import { isMockApiEnabled } from "@/lib/mock/config";
import { MOCK_DEMO_PASSWORD } from "@/lib/mock/fixtures";
import { useMfaStore } from "@/stores/mfa-store";
import { useSessionPreferencesStore } from "@/stores/session-preferences-store";
import type { AuthResponse } from "@/types/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

interface LoginFormProps {
  variant?: "card" | "panel";
  className?: string;
  onSwitchToSignUp?: () => void;
}

export function LoginForm({ variant = "card", className, onSwitchToSignUp }: LoginFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setSession } = useAuth();
  const setMfaChallenge = useMfaStore((state) => state.setChallenge);
  const recordLogin = useSessionPreferencesStore((state) => state.recordLogin);
  const [error, setError] = useState<string | null>(null);

  const returnUrl = searchParams.get("returnUrl");
  const reason = searchParams.get("reason");

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", rememberMe: true },
  });

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = form;

  async function onSubmit(values: LoginFormValues) {
    setError(null);
    try {
      const response = await login({
        email: values.email,
        password: values.password,
        rememberMe: values.rememberMe,
      });
      const data = response.data;

      if (data.requiresMfa && data.mfaToken) {
        setMfaChallenge({
          mfaToken: data.mfaToken,
          availableMethods: data.availableMethods ?? ["totp"],
          maskedEmail: data.maskedEmail,
        });
        const mfaUrl = returnUrl
          ? `/mfa?returnUrl=${encodeURIComponent(returnUrl)}`
          : "/mfa";
        router.replace(mfaUrl);
        return;
      }

      if (!data.accessToken || !data.role || !data.email) {
        throw new Error("Invalid authentication response");
      }

      setSession(data as AuthResponse, values.rememberMe);
      recordLogin();
      router.replace(
        resolvePostLoginPath(returnUrl, getDefaultDashboardPath(data.role)),
      );
    } catch (err) {
      setError(mapAuthError(err));
    }
  }

  const formBody = (
    <form onSubmit={handleSubmit(onSubmit)} className={cn(variant === "panel" ? "space-y-3" : "space-y-4")}>
      {reason === "session_expired" && (
        <WarningAlert message="Your session has expired. Sign in to continue." />
      )}
      {searchParams.get("registered") === "1" && (
        <SuccessAlert message="Account created. Sign in with your email and password." />
      )}
      {error && <ErrorAlert message={error} />}

      <EmailField control={control} name="email" label="Email" required />

      <div className="flex justify-end">
        <Link href="/forgot-password" className="text-xs font-medium text-primary hover:underline">
          Forgot password?
        </Link>
      </div>

      <PasswordField control={control} name="password" label="Password" required />

      <Controller
        control={control}
        name="rememberMe"
        render={({ field }) => (
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={field.value} onCheckedChange={(checked) => field.onChange(checked === true)} />
            <span>Remember me</span>
          </label>
        )}
      />

      <Button type="submit" className={cn("w-full", variant === "panel" && "mt-1")} disabled={isSubmitting}>
        {isSubmitting ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );

  if (variant === "panel") {
    return (
      <div className={cn("flex h-full flex-col justify-center px-6 py-8 sm:px-10", className)}>
        <div className="mb-5 text-center">
          <h1 className="text-xl font-semibold tracking-tight">Sign in</h1>
          <p className="mt-1 text-sm text-muted-foreground">Access your FundFlow workspace</p>
          {process.env.NODE_ENV === "development" && (
            <p className="mt-2 text-[11px] uppercase tracking-wide text-warning">Development environment</p>
          )}
        </div>
        {formBody}
        {isMockApiEnabled() && (
          <p className="mt-4 rounded-md border border-primary/20 bg-primary/5 px-3 py-2 text-center text-xs text-muted-foreground">
            Demo: <strong className="text-foreground">admin@demo.local</strong> / password{" "}
            <strong className="font-mono text-primary">{MOCK_DEMO_PASSWORD}</strong>
            <br />
            MFA demo: <strong className="text-foreground">mfa@demo.local</strong> → code{" "}
            <strong className="font-mono text-primary">123456</strong>
          </p>
        )}
        {onSwitchToSignUp && (
          <p className="mt-5 text-center text-sm text-muted-foreground lg:hidden">
            New organization?{" "}
            <button type="button" onClick={onSwitchToSignUp} className="font-medium text-primary hover:underline">
              Create an account
            </button>
          </p>
        )}
      </div>
    );
  }

  return (
    <Card className={cn("w-full max-w-md border-border", className)}>
      <CardHeader>
        <CardTitle>Sign in</CardTitle>
        <CardDescription>Access your FundFlow ERP workspace</CardDescription>
      </CardHeader>
      <CardContent>
        {formBody}
        <p className="mt-6 text-center text-sm text-muted-foreground">
          New organization?{" "}
          <Link href="/register" className="font-medium text-primary hover:underline">
            Create an account
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
