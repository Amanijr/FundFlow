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
import type { SponsorshipStatus, StudentSponsorshipRequest } from "@/types/verticals";

const sponsorshipStatuses: SponsorshipStatus[] = ["ACTIVE", "COMPLETED", "CANCELLED"];

const sponsorshipSchema = z.object({
  beneficiaryId: z.string().min(1, "Beneficiary is required"),
  donorId: z.string().min(1, "Donor is required"),
  academicYear: z.string().min(1, "Academic year is required").max(20),
  term: z.string().max(50).optional(),
  amount: z.number().positive("Amount must be greater than zero"),
  status: z.enum(["ACTIVE", "COMPLETED", "CANCELLED"]),
  startDate: z.date().nullable().optional(),
  endDate: z.date().nullable().optional(),
  notes: z.string().max(1000).optional(),
});

export type SponsorshipFormValues = z.infer<typeof sponsorshipSchema>;

interface SponsorshipFormProps {
  defaultValues?: Partial<SponsorshipFormValues>;
  beneficiaryOptions: { id: string; label: string; description?: string }[];
  donorOptions: { id: string; label: string; description?: string }[];
  submitLabel: string;
  serverError?: string | null;
  onSubmit: (values: StudentSponsorshipRequest) => Promise<void>;
  onCancel?: () => void;
}

export function SponsorshipForm({
  defaultValues,
  beneficiaryOptions,
  donorOptions,
  submitLabel,
  serverError,
  onSubmit,
  onCancel,
}: SponsorshipFormProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SponsorshipFormValues>({
    resolver: zodResolver(sponsorshipSchema),
    defaultValues: {
      beneficiaryId: "",
      donorId: "",
      academicYear: "",
      term: "",
      amount: 0,
      status: "ACTIVE",
      startDate: null,
      endDate: null,
      notes: "",
      ...defaultValues,
    },
  });

  async function handleFormSubmit(values: SponsorshipFormValues) {
    await onSubmit({
      beneficiaryId: Number(values.beneficiaryId),
      donorId: Number(values.donorId),
      academicYear: values.academicYear,
      term: values.term || undefined,
      amount: values.amount,
      status: values.status,
      startDate: toApiDate(values.startDate),
      endDate: toApiDate(values.endDate),
      notes: values.notes || undefined,
    });
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {serverError && <ErrorAlert message={serverError} />}

      <FormSection title="Sponsorship details" description="Link a student beneficiary to a donor">
        <FormField label="Beneficiary" error={errors.beneficiaryId?.message} className="sm:col-span-2">
          <Controller
            control={control}
            name="beneficiaryId"
            render={({ field }) => (
              <EntitySelector
                options={beneficiaryOptions}
                value={field.value ?? ""}
                onChange={field.onChange}
                placeholder="Select student beneficiary"
              />
            )}
          />
        </FormField>
        <FormField label="Donor" error={errors.donorId?.message} className="sm:col-span-2">
          <Controller
            control={control}
            name="donorId"
            render={({ field }) => (
              <EntitySelector
                options={donorOptions}
                value={field.value ?? ""}
                onChange={field.onChange}
                placeholder="Select donor"
              />
            )}
          />
        </FormField>
        <FormField label="Academic year" error={errors.academicYear?.message}>
          <Input {...register("academicYear")} placeholder="e.g. 2025-2026" />
        </FormField>
        <FormField label="Term">
          <Input {...register("term")} />
        </FormField>
        <FormField label="Amount" error={errors.amount?.message}>
          <Controller
            control={control}
            name="amount"
            render={({ field }) => (
              <CurrencyInput
                value={field.value ?? 0}
                onChange={(value) => field.onChange(value === "" ? 0 : value)}
              />
            )}
          />
        </FormField>
        <FormField label="Status" error={errors.status?.message}>
          <select
            className="h-9 w-full rounded-md border border-input bg-surface px-2.5 text-sm"
            {...register("status")}
          >
            {sponsorshipStatuses.map((status) => (
              <option key={status} value={status}>
                {status.replaceAll("_", " ")}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Start date">
          <Controller
            control={control}
            name="startDate"
            render={({ field }) => <DateInput value={field.value ?? null} onChange={field.onChange} />}
          />
        </FormField>
        <FormField label="End date">
          <Controller
            control={control}
            name="endDate"
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
