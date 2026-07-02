"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { FormField } from "@/components/forms/form-field";
import { FormSection } from "@/components/forms/form-section";
import { ErrorAlert } from "@/components/feedback/error-alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { DonorRequest } from "@/types/fundraising";

const donorSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(50),
  lastName: z.string().min(1, "Last name is required").max(50),
  email: z.string().email("Enter a valid email").max(100),
  phone: z.string().min(1, "Phone is required").max(15),
  address: z.string().max(255).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
});

export type DonorFormValues = z.infer<typeof donorSchema>;

interface DonorFormProps {
  defaultValues?: Partial<DonorFormValues>;
  submitLabel: string;
  serverError?: string | null;
  onSubmit: (values: DonorRequest) => Promise<void>;
  onCancel?: () => void;
}

export function DonorForm({ defaultValues, submitLabel, serverError, onSubmit, onCancel }: DonorFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DonorFormValues>({
    resolver: zodResolver(donorSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      country: "",
      ...defaultValues,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {serverError && <ErrorAlert message={serverError} />}

      <FormSection title="Contact" description="Primary donor information">
        <FormField label="First name" error={errors.firstName?.message}>
          <Input {...register("firstName")} />
        </FormField>
        <FormField label="Last name" error={errors.lastName?.message}>
          <Input {...register("lastName")} />
        </FormField>
        <FormField label="Email" error={errors.email?.message}>
          <Input type="email" {...register("email")} />
        </FormField>
        <FormField label="Phone" error={errors.phone?.message}>
          <Input {...register("phone")} />
        </FormField>
      </FormSection>

      <FormSection title="Address" description="Optional mailing address">
        <FormField label="Street" className="sm:col-span-2">
          <Input {...register("address")} />
        </FormField>
        <FormField label="City">
          <Input {...register("city")} />
        </FormField>
        <FormField label="State">
          <Input {...register("state")} />
        </FormField>
        <FormField label="Country">
          <Input {...register("country")} />
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
