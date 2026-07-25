"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { DateInput } from "@/components/forms/date-input";
import { EntitySelector } from "@/components/forms/entity-selector";
import { FormField } from "@/components/forms/form-field";
import { FormSection } from "@/components/forms/form-section";
import { ErrorAlert } from "@/components/feedback/error-alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toApiDate } from "@/lib/utils/dates";
import type { ProgramRequest, ProgramStatus } from "@/types/verticals";

const programStatuses: ProgramStatus[] = ["PLANNED", "ACTIVE", "COMPLETED", "ON_HOLD"];

const programSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  code: z.string().min(1, "Code is required").max(50),
  description: z.string().max(2000).optional(),
  status: z.enum(["PLANNED", "ACTIVE", "COMPLETED", "ON_HOLD"]),
  startDate: z.date().nullable().optional(),
  endDate: z.date().nullable().optional(),
  fundId: z.string().optional(),
});

export type ProgramFormValues = z.infer<typeof programSchema>;

interface ProgramFormProps {
  defaultValues?: Partial<ProgramFormValues>;
  fundOptions: { id: string; label: string; description?: string }[];
  submitLabel: string;
  serverError?: string | null;
  onSubmit: (values: ProgramRequest) => Promise<void>;
  onCancel?: () => void;
}

export function ProgramForm({
  defaultValues,
  fundOptions,
  submitLabel,
  serverError,
  onSubmit,
  onCancel,
}: ProgramFormProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProgramFormValues>({
    resolver: zodResolver(programSchema),
    defaultValues: {
      name: "",
      code: "",
      description: "",
      status: "PLANNED",
      startDate: null,
      endDate: null,
      fundId: "",
      ...defaultValues,
    },
  });

  async function handleFormSubmit(values: ProgramFormValues) {
    await onSubmit({
      name: values.name,
      code: values.code,
      description: values.description || undefined,
      status: values.status,
      startDate: toApiDate(values.startDate),
      endDate: toApiDate(values.endDate),
      fundId: values.fundId ? Number(values.fundId) : undefined,
    });
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {serverError && <ErrorAlert message={serverError} />}

      <FormSection title="Program details" description="Name, code, timeline, and linked fund">
        <FormField label="Name" error={errors.name?.message} className="sm:col-span-2">
          <Input {...register("name")} />
        </FormField>
        <FormField label="Code" error={errors.code?.message}>
          <Input {...register("code")} />
        </FormField>
        <FormField label="Status" error={errors.status?.message}>
          <select
            className="h-9 w-full rounded-md border border-input bg-surface px-2.5 text-sm"
            {...register("status")}
          >
            {programStatuses.map((status) => (
              <option key={status} value={status}>
                {status.replaceAll("_", " ")}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Description" className="sm:col-span-2">
          <Input {...register("description")} />
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
        <FormField label="Linked fund" className="sm:col-span-2">
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
