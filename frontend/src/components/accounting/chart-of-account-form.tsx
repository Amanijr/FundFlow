"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { FormField } from "@/components/forms/form-field";
import { FormSection } from "@/components/forms/form-section";
import { ErrorAlert } from "@/components/feedback/error-alert";
import { formatEnumLabel } from "@/components/finance/finance-status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { AccountType, ChartOfAccountRequest } from "@/types/accounting";

const accountTypes: AccountType[] = ["ASSET", "LIABILITY", "EQUITY", "REVENUE", "EXPENSE"];

const schema = z.object({
  code: z.string().min(1, "Bookkeeping number is required").max(20),
  name: z.string().min(1, "Name is required").max(255),
  accountType: z.enum(["ASSET", "LIABILITY", "EQUITY", "REVENUE", "EXPENSE"]),
  description: z.string().max(500).optional(),
  active: z.boolean(),
});

export type ChartOfAccountFormValues = z.infer<typeof schema>;

interface ChartOfAccountFormProps {
  serverError?: string | null;
  onSubmit: (values: ChartOfAccountRequest) => Promise<void>;
  onCancel?: () => void;
}

export function ChartOfAccountForm({ serverError, onSubmit, onCancel }: ChartOfAccountFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ChartOfAccountFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { code: "", name: "", accountType: "EXPENSE", description: "", active: true },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {serverError && <ErrorAlert message={serverError} />}
      <FormSection
        title="Account"
        description="Give it a name people in the church will recognize. The number is only for the books."
      >
        <FormField label="Account name" error={errors.name?.message} required>
          <Input {...register("name")} placeholder="e.g. Tithes, Lipa, Building fund" />
        </FormField>
        <FormField
          label="Bookkeeping number"
          error={errors.code?.message}
          description="Internal only. Staff see the name, not this number."
        >
          <Input {...register("code")} placeholder="e.g. 4010" />
        </FormField>
        <FormField label="Type" error={errors.accountType?.message}>
          <select
            className="h-9 w-full rounded-md border border-input bg-surface px-2.5 text-sm"
            {...register("accountType")}
          >
            {accountTypes.map((type) => (
              <option key={type} value={type}>
                {formatEnumLabel(type)}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Description" className="sm:col-span-2">
          <Input {...register("description")} />
        </FormField>
        <FormField label="Active">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" className="h-4 w-4 rounded border-input" {...register("active")} />
            Account is active
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
          Create account
        </Button>
      </div>
    </form>
  );
}
