"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { DateInput } from "@/components/forms/date-input";
import { EntitySelector } from "@/components/forms/entity-selector";
import { FormField } from "@/components/forms/form-field";
import { FormSection } from "@/components/forms/form-section";
import { ErrorAlert } from "@/components/feedback/error-alert";
import { formatEnumLabel } from "@/components/finance/finance-status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toApiDate } from "@/lib/utils/dates";
import type { BudgetRequest, BudgetScopeType } from "@/types/finance";

const scopeTypes: BudgetScopeType[] = ["ORGANIZATION", "DEPARTMENT", "FUND", "CAMPAIGN", "PROGRAM"];

const budgetSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  fiscalYear: z.number().int().min(2000).max(2100),
  startDate: z.date({ message: "Start date is required" }),
  endDate: z.date({ message: "End date is required" }),
  scopeType: z.enum(["ORGANIZATION", "DEPARTMENT", "FUND", "CAMPAIGN", "PROGRAM"]),
  department: z.string().max(100).optional(),
  fundId: z.string().optional(),
  campaignId: z.string().optional(),
  programId: z.string().optional(),
});

export type BudgetFormValues = z.infer<typeof budgetSchema>;

interface BudgetFormProps {
  fundOptions?: { id: string; label: string; description?: string }[];
  campaignOptions?: { id: string; label: string; description?: string }[];
  defaultValues?: Partial<BudgetFormValues>;
  submitLabel: string;
  serverError?: string | null;
  onSubmit: (values: BudgetRequest) => Promise<void>;
  onCancel?: () => void;
}

export function BudgetForm({
  fundOptions = [],
  campaignOptions = [],
  defaultValues,
  submitLabel,
  serverError,
  onSubmit,
  onCancel,
}: BudgetFormProps) {
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      name: "",
      fiscalYear: new Date().getFullYear(),
      scopeType: "ORGANIZATION",
      department: "",
      fundId: "",
      campaignId: "",
      programId: "",
      ...defaultValues,
    },
  });

  const scopeType = watch("scopeType");

  async function handleFormSubmit(values: BudgetFormValues) {
    await onSubmit({
      name: values.name,
      fiscalYear: values.fiscalYear,
      startDate: toApiDate(values.startDate)!,
      endDate: toApiDate(values.endDate)!,
      scopeType: values.scopeType,
      department: values.department || undefined,
      fundId: values.fundId ? Number(values.fundId) : undefined,
      campaignId: values.campaignId ? Number(values.campaignId) : undefined,
      programId: values.programId ? Number(values.programId) : undefined,
    });
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {serverError && <ErrorAlert message={serverError} />}

      <FormSection title="Budget period" description="Fiscal year and date range">
        <FormField label="Name" error={errors.name?.message} className="sm:col-span-2">
          <Input {...register("name")} />
        </FormField>
        <FormField label="Fiscal year" error={errors.fiscalYear?.message}>
          <Input type="number" {...register("fiscalYear", { valueAsNumber: true })} />
        </FormField>
        <FormField label="Scope" error={errors.scopeType?.message}>
          <select
            className="h-9 w-full rounded-md border border-input bg-surface px-2.5 text-sm"
            {...register("scopeType")}
          >
            {scopeTypes.map((type) => (
              <option key={type} value={type}>
                {formatEnumLabel(type)}
              </option>
            ))}
          </select>
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
        {scopeType === "DEPARTMENT" && (
          <FormField label="Department">
            <Input {...register("department")} />
          </FormField>
        )}
        {scopeType === "FUND" && (
          <FormField label="Fund" className="sm:col-span-2">
            <Controller
              control={control}
              name="fundId"
              render={({ field }) => (
                <EntitySelector value={field.value} onChange={field.onChange} options={fundOptions} />
              )}
            />
          </FormField>
        )}
        {scopeType === "CAMPAIGN" && (
          <FormField label="Campaign" className="sm:col-span-2">
            <Controller
              control={control}
              name="campaignId"
              render={({ field }) => (
                <EntitySelector value={field.value} onChange={field.onChange} options={campaignOptions} />
              )}
            />
          </FormField>
        )}
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
