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
import type { ServiceEventRequest } from "@/types/verticals";

const serviceSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  serviceDate: z.date({ message: "Date is required" }),
  startsAt: z.string().optional(),
  location: z.string().max(255).optional(),
  ministryId: z.string().optional(),
  notes: z.string().max(1000).optional(),
});

export type ServiceFormValues = z.infer<typeof serviceSchema>;

interface ServiceFormProps {
  ministryOptions: { id: string; label: string; description?: string }[];
  defaultValues?: Partial<ServiceFormValues>;
  submitLabel: string;
  serverError?: string | null;
  onSubmit: (values: ServiceEventRequest) => Promise<void>;
  onCancel?: () => void;
}

export function ServiceForm({
  ministryOptions,
  defaultValues,
  submitLabel,
  serverError,
  onSubmit,
  onCancel,
}: ServiceFormProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: "",
      startsAt: "",
      location: "",
      ministryId: "",
      notes: "",
      ...defaultValues,
    },
  });

  async function handleFormSubmit(values: ServiceFormValues) {
    const startsAt = values.startsAt?.trim();
    await onSubmit({
      name: values.name,
      serviceDate: toApiDate(values.serviceDate)!,
      startsAt: startsAt ? (startsAt.length === 5 ? `${startsAt}:00` : startsAt) : undefined,
      location: values.location?.trim() || undefined,
      ministryId: values.ministryId ? Number(values.ministryId) : undefined,
      notes: values.notes?.trim() || undefined,
    });
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {serverError && <ErrorAlert message={serverError} />}

      <FormSection title="Service details" description="Sunday, midweek, or another gathering.">
        <FormField label="Name" error={errors.name?.message} className="sm:col-span-2">
          <Input {...register("name")} placeholder="Sunday service" />
        </FormField>
        <FormField label="Date" error={errors.serviceDate?.message}>
          <Controller
            control={control}
            name="serviceDate"
            render={({ field }) => <DateInput value={field.value ?? null} onChange={field.onChange} />}
          />
        </FormField>
        <FormField label="Start time">
          <Input type="time" {...register("startsAt")} />
        </FormField>
        <FormField label="Ministry" className="sm:col-span-2">
          <Controller
            control={control}
            name="ministryId"
            render={({ field }) => (
              <EntitySelector
                options={ministryOptions}
                value={field.value ?? ""}
                onChange={field.onChange}
                placeholder="Optional ministry"
              />
            )}
          />
        </FormField>
        <FormField label="Location" className="sm:col-span-2">
          <Input {...register("location")} placeholder="Main sanctuary" />
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
