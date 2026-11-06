"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { ErrorAlert } from "@/components/feedback/error-alert";
import { FormActions } from "@/components/forms/layout/form-actions";
import { FormField } from "@/components/forms/form-field";
import { Input } from "@/components/ui/input";
import type { SessionUser } from "@/types/api";

const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(80),
  lastName: z.string().min(1, "Last name is required").max(80),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;

interface ProfileFormProps {
  user: SessionUser;
  serverError?: string | null;
  onSubmit: (values: ProfileFormValues) => Promise<void>;
}

export function ProfileForm({ user, serverError, onSubmit }: ProfileFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user.firstName,
      lastName: user.lastName,
    },
  });

  useEffect(() => {
    reset({ firstName: user.firstName, lastName: user.lastName });
  }, [reset, user.firstName, user.lastName]);

  return (
    <form
      className="space-y-4"
      onSubmit={handleSubmit(async (values) => {
        await onSubmit(values);
      })}
    >
      {serverError ? <ErrorAlert message={serverError} /> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="First name" htmlFor="profile-first-name" error={errors.firstName?.message}>
          <Input id="profile-first-name" autoComplete="given-name" {...register("firstName")} />
        </FormField>
        <FormField label="Last name" htmlFor="profile-last-name" error={errors.lastName?.message}>
          <Input id="profile-last-name" autoComplete="family-name" {...register("lastName")} />
        </FormField>
      </div>

      <FormField
        label="Email"
        htmlFor="profile-email"
        description="Email is used for sign-in and cannot be changed here."
      >
        <Input id="profile-email" value={user.email} disabled readOnly />
      </FormField>

      <FormActions
        submitLabel="Save profile"
        isSubmitting={isSubmitting}
        submitDisabled={!isDirty}
        cancelLabel="Reset"
        onCancel={() => reset({ firstName: user.firstName, lastName: user.lastName })}
      />
    </form>
  );
}
