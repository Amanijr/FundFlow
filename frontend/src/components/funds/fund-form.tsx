"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { CurrencyInput } from "@/components/forms/currency-input";
import { FormField } from "@/components/forms/form-field";
import { FormSection } from "@/components/forms/form-section";
import { ErrorAlert } from "@/components/feedback/error-alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatEnumLabel } from "@/components/finance/finance-status-badge";
import type { FundRequest, FundType } from "@/types/finance";

const fundTypes: FundType[] = ["RESTRICTED", "UNRESTRICTED", "PROJECT", "ENDOWMENT"];

const fundSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  code: z.string().min(1, "Code is required").max(50),
  type: z.enum(["RESTRICTED", "UNRESTRICTED", "PROJECT", "ENDOWMENT"]),
  description: z.string().max(1000).optional(),
  openingBalance: z.number().min(0, "Cannot be negative").optional(),
  active: z.boolean(),
});

export type FundFormValues = z.infer<typeof fundSchema>;

interface FundFormProps {
  defaultValues?: Partial<FundFormValues>;
  submitLabel: string;
  serverError?: string | null;
  onSubmit: (values: FundRequest) => Promise<void>;
  onCancel?: () => void;
}

export function FundForm({ defaultValues, submitLabel, serverError, onSubmit, onCancel }: FundFormProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FundFormValues>({
    resolver: zodResolver(fundSchema),
    defaultValues: {
      name: "",
      code: "",
      type: "UNRESTRICTED",
      description: "",
      openingBalance: 0,
      active: true,
      ...defaultValues,
    },
  });

  async function handleFormSubmit(values: FundFormValues) {
    await onSubmit({
      name: values.name,
      code: values.code,
      type: values.type,
      description: values.description || undefined,
      openingBalance: values.openingBalance,
      active: values.active,
    });
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {serverError && <ErrorAlert message={serverError} />}

      <FormSection title="Fund details" description="Classification and opening balance">
        <FormField label="Name" error={errors.name?.message}>
          <Input {...register("name")} />
        </FormField>
        <FormField label="Code" error={errors.code?.message}>
          <Input {...register("code")} />
        </FormField>
        <FormField label="Type" error={errors.type?.message}>
          <select className="h-9 w-full rounded-md border border-input bg-surface px-2.5 text-sm" {...register("type")}>
            {fundTypes.map((type) => (
              <option key={type} value={type}>
                {formatEnumLabel(type)}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Opening balance" error={errors.openingBalance?.message}>
          <Controller
            control={control}
            name="openingBalance"
            render={({ field }) => (
              <CurrencyInput value={field.value ?? 0} onChange={(v) => field.onChange(v === "" ? 0 : v)} />
            )}
          />
        </FormField>
        <FormField label="Description" className="sm:col-span-2">
          <Input {...register("description")} />
        </FormField>
        <FormField label="Active">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" className="h-4 w-4 rounded border-input" {...register("active")} />
            Fund is active
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
