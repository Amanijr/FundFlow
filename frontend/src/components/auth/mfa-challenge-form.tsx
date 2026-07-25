"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { FormActions, FormContainer, TextField } from "@/components/forms";
import { ErrorAlert } from "@/components/feedback/error-alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { verifyMfa } from "@/lib/api/auth";
import { mapAuthError } from "@/lib/auth/error-messages";
import { resolvePostLoginPath } from "@/lib/auth/return-url";
import { useAuth } from "@/hooks/use-auth";
import { getDefaultDashboardPath } from "@/lib/navigation/permissions";
import { useMfaStore } from "@/stores/mfa-store";
import type { AuthResponse } from "@/types/api";
import { cn } from "@/lib/utils";

const schema = z.object({
  code: z.string().min(6, "Enter the 6-digit code").max(8, "Code is too long"),
});

type FormValues = z.infer<typeof schema>;

interface MfaChallengeFormProps {
  returnUrl?: string | null;
  className?: string;
}

export function MfaChallengeForm({ returnUrl, className }: MfaChallengeFormProps) {
  const router = useRouter();
  const { setSession } = useAuth();
  const { mfaToken, maskedEmail, clearChallenge } = useMfaStore();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { code: "" },
  });

  const { control, handleSubmit, formState: { isSubmitting } } = form;

  async function onSubmit(values: FormValues) {
    if (!mfaToken) {
      router.replace("/login");
      return;
    }
    setError(null);
    try {
      const response = await verifyMfa({
        mfaToken,
        method: "totp",
        code: values.code,
      });
      clearChallenge();
      setSession(response.data as AuthResponse);
      router.replace(resolvePostLoginPath(returnUrl ?? null, getDefaultDashboardPath(response.data.role)));
    } catch (err) {
      setError(mapAuthError(err));
    }
  }

  return (
    <Card className={cn("w-full max-w-md border-border", className)}>
      <CardHeader>
        <CardTitle>Verify your identity</CardTitle>
        <CardDescription>
          Enter the 6-digit code from your authenticator app
          {maskedEmail ? ` or sent to ${maskedEmail}` : ""}.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormContainer onSubmit={handleSubmit(onSubmit)}>
          {error && <ErrorAlert message={error} />}
          <TextField
            control={control}
            name="code"
            label="Verification code"
            placeholder="123456"
            required
          />
          <FormActions submitLabel="Verify" isSubmitting={isSubmitting} />
        </FormContainer>
        <p className="text-center text-sm text-muted-foreground">
          <Link href="/login" className="font-medium text-primary hover:underline">
            Back to sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
