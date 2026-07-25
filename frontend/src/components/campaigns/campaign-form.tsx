"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { CurrencyInput } from "@/components/forms/currency-input";
import { DateInput } from "@/components/forms/date-input";
import { FormField } from "@/components/forms/form-field";
import { FormSection } from "@/components/forms/form-section";
import { ErrorAlert } from "@/components/feedback/error-alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toApiDate } from "@/lib/utils/dates";
import type { CampaignRequest, CampaignStatus } from "@/types/fundraising";

const campaignStatuses: CampaignStatus[] = ["DRAFT", "ACTIVE", "COMPLETED", "CANCELLED"];

const campaignSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  description: z.string().max(2000).optional(),
  targetAmount: z.number().positive("Target must be greater than zero").optional().or(z.literal(0)),
  startDate: z.date().nullable().optional(),
  endDate: z.date().nullable().optional(),
  status: z.enum(["DRAFT", "ACTIVE", "COMPLETED", "CANCELLED"]),
});

export type CampaignFormValues = z.infer<typeof campaignSchema>;

interface CampaignFormProps {
  defaultValues?: Partial<CampaignFormValues>;
  submitLabel: string;
  serverError?: string | null;
  onSubmit: (values: CampaignRequest) => Promise<void>;
  onCancel?: () => void;
}

export function CampaignForm({
  defaultValues,
  submitLabel,
  serverError,
  onSubmit,
  onCancel,
}: CampaignFormProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CampaignFormValues>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      name: "",
      description: "",
      targetAmount: 0,
      startDate: null,
      endDate: null,
      status: "DRAFT",
      ...defaultValues,
    },
  });

  async function handleFormSubmit(values: CampaignFormValues) {
    await onSubmit({
      name: values.name,
      description: values.description || undefined,
      targetAmount: values.targetAmount && values.targetAmount > 0 ? values.targetAmount : undefined,
      startDate: toApiDate(values.startDate),
      endDate: toApiDate(values.endDate),
      status: values.status,
    });
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {serverError && <ErrorAlert message={serverError} />}

      <FormSection title="Campaign details" description="Goal, timeline, and status">
        <FormField label="Name" error={errors.name?.message} className="sm:col-span-2">
          <Input {...register("name")} />
        </FormField>
        <FormField label="Description" className="sm:col-span-2">
          <Input {...register("description")} />
        </FormField>
        <FormField label="Target amount" error={errors.targetAmount?.message}>
          <Controller
            control={control}
            name="targetAmount"
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
            {campaignStatuses.map((status) => (
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
