"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { CurrencyInput } from "@/components/forms/currency-input";
import { DateInput } from "@/components/forms/date-input";
import { EntitySelector } from "@/components/forms/entity-selector";
import { FormField } from "@/components/forms/form-field";
import { FormSection } from "@/components/forms/form-section";
import { ErrorAlert } from "@/components/feedback/error-alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toApiDate } from "@/lib/utils/dates";
import type { GrantRequest, GrantRestrictionType } from "@/types/verticals";

const restrictionTypes: GrantRestrictionType[] = [
  "UNRESTRICTED",
  "PURPOSE_RESTRICTED",
  "TIME_RESTRICTED",
  "FULLY_RESTRICTED",
];

const grantSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  grantCode: z.string().min(1, "Grant code is required").max(50),
  funderName: z.string().min(1, "Funder name is required").max(255),
  awardedAmount: z.number().positive("Awarded amount must be greater than zero"),
  startDate: z.date({ message: "Start date is required" }),
  endDate: z.date({ message: "End date is required" }),
  restrictionType: z.enum(["UNRESTRICTED", "PURPOSE_RESTRICTED", "TIME_RESTRICTED", "FULLY_RESTRICTED"]),
  restrictionNotes: z.string().max(2000).optional(),
  programId: z.string().optional(),
  fundId: z.string().optional(),
});

export type GrantFormValues = z.infer<typeof grantSchema>;

interface GrantFormProps {
  defaultValues?: Partial<GrantFormValues>;
  programOptions: { id: string; label: string; description?: string }[];
  fundOptions: { id: string; label: string; description?: string }[];
  submitLabel: string;
  serverError?: string | null;
  onSubmit: (values: GrantRequest) => Promise<void>;
  onCancel?: () => void;
}

export function GrantForm({
  defaultValues,
  programOptions,
  fundOptions,
  submitLabel,
  serverError,
  onSubmit,
  onCancel,
}: GrantFormProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<GrantFormValues>({
    resolver: zodResolver(grantSchema),
    defaultValues: {
      name: "",
      grantCode: "",
      funderName: "",
      awardedAmount: 0,
      restrictionType: "UNRESTRICTED",
      restrictionNotes: "",
      programId: "",
      fundId: "",
      ...defaultValues,
    },
  });

  async function handleFormSubmit(values: GrantFormValues) {
    await onSubmit({
      name: values.name,
      grantCode: values.grantCode,
      funderName: values.funderName,
      awardedAmount: values.awardedAmount,
      startDate: toApiDate(values.startDate)!,
      endDate: toApiDate(values.endDate)!,
      restrictionType: values.restrictionType,
      restrictionNotes: values.restrictionNotes || undefined,
      programId: values.programId ? Number(values.programId) : undefined,
      fundId: values.fundId ? Number(values.fundId) : undefined,
    });
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {serverError && <ErrorAlert message={serverError} />}

      <FormSection title="Grant details" description="Award, funder, and restriction information">
        <FormField label="Name" error={errors.name?.message} className="sm:col-span-2">
          <Input {...register("name")} />
        </FormField>
        <FormField label="Grant code" error={errors.grantCode?.message}>
          <Input {...register("grantCode")} />
        </FormField>
        <FormField label="Funder" error={errors.funderName?.message}>
          <Input {...register("funderName")} />
        </FormField>
        <FormField label="Awarded amount" error={errors.awardedAmount?.message}>
          <Controller
            control={control}
            name="awardedAmount"
            render={({ field }) => (
              <CurrencyInput
                value={field.value ?? 0}
                onChange={(value) => field.onChange(value === "" ? 0 : value)}
              />
            )}
          />
        </FormField>
        <FormField label="Restriction type" error={errors.restrictionType?.message}>
          <select
            className="h-9 w-full rounded-md border border-input bg-surface px-2.5 text-sm"
            {...register("restrictionType")}
          >
            {restrictionTypes.map((type) => (
              <option key={type} value={type}>
                {type.replaceAll("_", " ")}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Restriction notes" className="sm:col-span-2">
          <Input {...register("restrictionNotes")} />
        </FormField>
        <FormField label="Start date" error={errors.startDate?.message}>
          <Controller
            control={control}
            name="startDate"
            render={({ field }) => <DateInput value={field.value ?? null} onChange={field.onChange} />}
          />
        </FormField>
        <FormField label="End date" error={errors.endDate?.message}>
          <Controller
            control={control}
            name="endDate"
            render={({ field }) => <DateInput value={field.value ?? null} onChange={field.onChange} />}
          />
        </FormField>
        <FormField label="Program" className="sm:col-span-2">
          <Controller
            control={control}
            name="programId"
            render={({ field }) => (
              <EntitySelector
                options={programOptions}
                value={field.value ?? ""}
                onChange={field.onChange}
                placeholder="Select program (optional)"
              />
            )}
          />
        </FormField>
        <FormField label="Fund" className="sm:col-span-2">
          <Controller
            control={control}
            name="fundId"
            render={({ field }) => (
              <EntitySelector
                options={fundOptions}
                value={field.value ?? ""}
                onChange={field.onChange}
                placeholder="Select fund (optional)"
              />
            )}
          />
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
