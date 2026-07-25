"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { FormActions, FormContainer, PasswordField } from "@/components/forms";
import { ErrorAlert } from "@/components/feedback/error-alert";
import { SuccessAlert } from "@/components/feedback/success-alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { resetPassword } from "@/lib/api/auth";
import { mapAuthError } from "@/lib/auth/error-messages";
import { cn } from "@/lib/utils";

const schema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Confirm your password"),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof schema>;

interface ResetPasswordFormProps {
  token: string | null;
  variant?: "card" | "panel";
  className?: string;
}

export function ResetPasswordForm({ token, variant = "card", className }: ResetPasswordFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const { control, handleSubmit, formState: { isSubmitting } } = form;

  async function onSubmit(values: FormValues) {
    if (!token) {
      setError("This reset link is invalid.");
      return;
    }
    setError(null);
    try {
      await resetPassword({ token, password: values.password });
      setCompleted(true);
      window.setTimeout(() => router.replace("/login"), 2000);
    } catch (err) {
      setError(mapAuthError(err));
    }
  }

  if (!token) {
    return (
      <Card className={cn("w-full max-w-md border-border", className)}>
        <CardContent className="pt-6">
          <ErrorAlert message="This reset link is invalid. Request a new password reset." />
          <p className="mt-4 text-center text-sm">
            <Link href="/forgot-password" className="font-medium text-primary hover:underline">
              Request reset link
            </Link>
          </p>
        </CardContent>
      </Card>
    );
  }

  const content = completed ? (
    <SuccessAlert message="Password updated. Redirecting to sign in…" />
  ) : (
    <FormContainer onSubmit={handleSubmit(onSubmit)}>
      {error && <ErrorAlert message={error} />}
      <PasswordField control={control} name="password" label="New password" required />
      <PasswordField control={control} name="confirmPassword" label="Confirm password" required />
      <FormActions submitLabel="Update password" isSubmitting={isSubmitting} />
    </FormContainer>
  );

  if (variant === "panel") {
    return (
      <div className={cn("w-full max-w-md space-y-4", className)}>
        <div className="text-center">
          <h1 className="text-xl font-semibold tracking-tight">Reset password</h1>
          <p className="mt-1 text-sm text-muted-foreground">Choose a new password for your account.</p>
        </div>
        {content}
      </div>
    );
  }

  return (
    <Card className={cn("w-full max-w-md border-border", className)}>
      <CardHeader>
        <CardTitle>Reset password</CardTitle>
        <CardDescription>Choose a new password for your account.</CardDescription>
      </CardHeader>
      <CardContent>{content}</CardContent>
    </Card>
  );
}
