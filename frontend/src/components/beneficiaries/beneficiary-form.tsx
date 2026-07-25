"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { DateInput } from "@/components/forms/date-input";
import { FormField } from "@/components/forms/form-field";
import { FormSection } from "@/components/forms/form-section";
import { ErrorAlert } from "@/components/feedback/error-alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toApiDate } from "@/lib/utils/dates";
import type { BeneficiaryRequest, BeneficiaryStatus, BeneficiaryType } from "@/types/verticals";

const beneficiaryTypes: BeneficiaryType[] = ["GENERAL", "STUDENT"];
const beneficiaryStatuses: BeneficiaryStatus[] = ["ACTIVE", "INACTIVE", "GRADUATED", "WITHDRAWN"];

const beneficiarySchema = z.object({
  firstName: z.string().min(1, "First name is required").max(50),
  lastName: z.string().min(1, "Last name is required").max(50),
  code: z.string().min(1, "Code is required").max(50),
  beneficiaryType: z.enum(["GENERAL", "STUDENT"]),
  status: z.enum(["ACTIVE", "INACTIVE", "GRADUATED", "WITHDRAWN"]),
  enrollmentDate: z.date().nullable().optional(),
  notes: z.string().max(2000).optional(),
});

export type BeneficiaryFormValues = z.infer<typeof beneficiarySchema>;

interface BeneficiaryFormProps {
  defaultValues?: Partial<BeneficiaryFormValues>;
  submitLabel: string;
  serverError?: string | null;
  onSubmit: (values: BeneficiaryRequest) => Promise<void>;
  onCancel?: () => void;
}

export function BeneficiaryForm({
  defaultValues,
  submitLabel,
  serverError,
  onSubmit,
  onCancel,
}: BeneficiaryFormProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<BeneficiaryFormValues>({
    resolver: zodResolver(beneficiarySchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      code: "",
      beneficiaryType: "GENERAL",
      status: "ACTIVE",
      enrollmentDate: null,
      notes: "",
      ...defaultValues,
    },
  });

  async function handleFormSubmit(values: BeneficiaryFormValues) {
    await onSubmit({
      firstName: values.firstName,
      lastName: values.lastName,
      code: values.code,
      beneficiaryType: values.beneficiaryType,
      status: values.status,
      enrollmentDate: toApiDate(values.enrollmentDate),
      notes: values.notes || undefined,
    });
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {serverError && <ErrorAlert message={serverError} />}

      <FormSection title="Beneficiary profile" description="Enrollment and contact details">
        <FormField label="First name" error={errors.firstName?.message}>
          <Input {...register("firstName")} />
        </FormField>
        <FormField label="Last name" error={errors.lastName?.message}>
          <Input {...register("lastName")} />
        </FormField>
        <FormField label="Code" error={errors.code?.message}>
          <Input {...register("code")} />
        </FormField>
        <FormField label="Type" error={errors.beneficiaryType?.message}>
          <select
            className="h-9 w-full rounded-md border border-input bg-surface px-2.5 text-sm"
            {...register("beneficiaryType")}
          >
            {beneficiaryTypes.map((type) => (
              <option key={type} value={type}>
                {type.replaceAll("_", " ")}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Status" error={errors.status?.message}>
          <select
            className="h-9 w-full rounded-md border border-input bg-surface px-2.5 text-sm"
            {...register("status")}
          >
            {beneficiaryStatuses.map((status) => (
              <option key={status} value={status}>
                {status.replaceAll("_", " ")}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Enrollment date">
          <Controller
            control={control}
            name="enrollmentDate"
            render={({ field }) => <DateInput value={field.value ?? null} onChange={field.onChange} />}
          />
        </FormField>
        <FormField label="Notes" className="sm:col-span-2">
          <Input {...register("notes")} />
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
