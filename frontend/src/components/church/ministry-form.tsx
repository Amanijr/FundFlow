"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { FormField } from "@/components/forms/form-field";
import { FormSection } from "@/components/forms/form-section";
import { ErrorAlert } from "@/components/feedback/error-alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { MinistryRequest } from "@/types/verticals";

const ministrySchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  code: z.string().min(1, "Code is required").max(50),
  description: z.string().max(2000).optional(),
  leaderName: z.string().max(255).optional(),
  active: z.boolean(),
});

export type MinistryFormValues = z.infer<typeof ministrySchema>;

interface MinistryFormProps {
  defaultValues?: Partial<MinistryFormValues>;
  submitLabel: string;
  serverError?: string | null;
  onSubmit: (values: MinistryRequest) => Promise<void>;
  onCancel?: () => void;
}

export function MinistryForm({
  defaultValues,
  submitLabel,
  serverError,
  onSubmit,
  onCancel,
}: MinistryFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<MinistryFormValues>({
    resolver: zodResolver(ministrySchema),
    defaultValues: {
      name: "",
      code: "",
      description: "",
      leaderName: "",
      active: true,
      ...defaultValues,
    },
  });

  async function handleFormSubmit(values: MinistryFormValues) {
    await onSubmit({
      name: values.name,
      code: values.code,
      description: values.description || undefined,
      leaderName: values.leaderName || undefined,
      active: values.active,
    });
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {serverError && <ErrorAlert message={serverError} />}

      <FormSection title="Ministry details" description="Church ministry or department">
        <FormField label="Name" error={errors.name?.message} className="sm:col-span-2">
          <Input {...register("name")} />
        </FormField>
        <FormField label="Code" error={errors.code?.message}>
          <Input {...register("code")} />
        </FormField>
        <FormField label="Leader">
          <Input {...register("leaderName")} />
        </FormField>
        <FormField label="Description" className="sm:col-span-2">
          <Input {...register("description")} />
        </FormField>
        <FormField label="Active" className="sm:col-span-2">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" {...register("active")} className="rounded border-input" />
            Ministry is active
          </label>
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
