"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { FormField } from "@/components/forms/form-field";
import { FormSection } from "@/components/forms/form-section";
import { ErrorAlert } from "@/components/feedback/error-alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CreateSuperAdminRequest } from "@/types/platform";

const superAdminSchema = z.object({
  email: z.string().email("Enter a valid email").max(100),
  password: z.string().min(8, "Password must be at least 8 characters").max(100),
  firstName: z.string().min(1, "First name is required").max(50),
  lastName: z.string().min(1, "Last name is required").max(50),
});

export type SuperAdminFormValues = z.infer<typeof superAdminSchema>;

interface SuperAdminFormProps {
  submitLabel: string;
  serverError?: string | null;
  onSubmit: (values: CreateSuperAdminRequest) => Promise<void>;
  onCancel?: () => void;
}

export function SuperAdminForm({ submitLabel, serverError, onSubmit, onCancel }: SuperAdminFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SuperAdminFormValues>({
    resolver: zodResolver(superAdminSchema),
    defaultValues: {
      email: "",
      password: "",
      firstName: "",
      lastName: "",
    },
  });

  async function handleFormSubmit(values: SuperAdminFormValues) {
    await onSubmit(values);
    reset();
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {serverError && <ErrorAlert message={serverError} />}

      <FormSection title="Super administrator" description="Add another platform owner account">
        <FormField label="Email" error={errors.email?.message} className="sm:col-span-2">
          <Input type="email" {...register("email")} />
        </FormField>
        <FormField label="Password" error={errors.password?.message} className="sm:col-span-2">
          <Input type="password" {...register("password")} />
        </FormField>
        <FormField label="First name" error={errors.firstName?.message}>
          <Input {...register("firstName")} />
        </FormField>
        <FormField label="Last name" error={errors.lastName?.message}>
          <Input {...register("lastName")} />
        </FormField>
      </FormSection>

      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
