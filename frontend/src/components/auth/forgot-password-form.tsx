"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { EmailField, FormContainer, FormActions } from "@/components/forms";
import { ErrorAlert } from "@/components/feedback/error-alert";
import { SuccessAlert } from "@/components/feedback/success-alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { forgotPassword } from "@/lib/api/auth";
import { mapAuthError } from "@/lib/auth/error-messages";
import { cn } from "@/lib/utils";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
});

type FormValues = z.infer<typeof schema>;

interface ForgotPasswordFormProps {
  variant?: "card" | "panel";
  className?: string;
}

export function ForgotPasswordForm({ variant = "card", className }: ForgotPasswordFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  const { control, handleSubmit, formState: { isSubmitting } } = form;

  async function onSubmit(values: FormValues) {
    setError(null);
    try {
      await forgotPassword(values);
      setSubmitted(true);
    } catch (err) {
      setError(mapAuthError(err));
    }
  }

  const content = submitted ? (
    <SuccessAlert message="If an account exists for that email, we have sent password reset instructions." />
  ) : (
    <FormContainer onSubmit={handleSubmit(onSubmit)}>
      {error && <ErrorAlert message={error} />}
      <EmailField control={control} name="email" label="Email" placeholder="you@organization.org" required />
      <FormActions submitLabel="Send reset link" isSubmitting={isSubmitting} />
    </FormContainer>
  );

  if (variant === "panel") {
    return (
      <div className={cn("w-full max-w-md space-y-4", className)}>
        <div className="text-center">
          <h1 className="text-xl font-semibold tracking-tight">Forgot password</h1>
          <p className="mt-1 text-sm text-muted-foreground">We will email you a link to reset your password.</p>
        </div>
        {content}
        <p className="text-center text-sm text-muted-foreground">
          <Link href="/login" className="font-medium text-primary hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    );
  }

  return (
    <Card className={cn("w-full max-w-md border-border", className)}>
      <CardHeader>
        <CardTitle>Forgot password</CardTitle>
        <CardDescription>We will email you a link to reset your password.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {content}
        <p className="text-center text-sm text-muted-foreground">
          <Link href="/login" className="font-medium text-primary hover:underline">
            Back to sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
