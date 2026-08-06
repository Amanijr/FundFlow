"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { CurrencyInput } from "@/components/forms/currency-input";
import { EntitySelector } from "@/components/forms/entity-selector";
import { FormField } from "@/components/forms/form-field";
import { FormSection } from "@/components/forms/form-section";
import { ErrorAlert } from "@/components/feedback/error-alert";
import { formatEnumLabel } from "@/components/finance/finance-status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { ExpenseCategory, ExpenseRequest, ExpenseType } from "@/types/finance";

const categories: ExpenseCategory[] = [
  "OPERATIONS",
  "PROGRAM",
  "ADMINISTRATIVE",
  "FUNDRAISING",
  "MISCELLANEOUS",
];

const expenseTypes: ExpenseType[] = ["REQUEST", "REIMBURSEMENT"];

const expenseSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  description: z.string().max(2000).optional(),
  amount: z.number().positive("Amount must be greater than zero"),
  category: z.enum(["OPERATIONS", "PROGRAM", "ADMINISTRATIVE", "FUNDRAISING", "MISCELLANEOUS"]),
  expenseType: z.enum(["REQUEST", "REIMBURSEMENT"]),
  fundId: z.string().optional(),
  payeeName: z.string().max(255).optional(),
  department: z.string().max(100).optional(),
});

export type ExpenseFormValues = z.infer<typeof expenseSchema>;

interface ExpenseFormProps {
  fundOptions: { id: string; label: string; description?: string }[];
  defaultValues?: Partial<ExpenseFormValues>;
  submitLabel?: string;
  serverError?: string | null;
  onSubmit: (values: ExpenseRequest) => Promise<void>;
  onCancel?: () => void;
}

const steps = ["Spending details", "Optional details"] as const;

export function ExpenseForm({
  fundOptions,
  defaultValues,
  submitLabel = "Save expense",
  serverError,
  onSubmit,
  onCancel,
}: ExpenseFormProps) {
  const [step, setStep] = useState(0);

  const {
    register,
    control,
    handleSubmit,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      title: "",
      description: "",
      amount: 0,
      category: "OPERATIONS",
      expenseType: "REQUEST",
      fundId: "",
      payeeName: "",
      department: "",
      ...defaultValues,
    },
  });

  async function goNext() {
    const valid = await trigger(["title", "amount", "category", "expenseType"]);
    if (valid) {
      setStep(1);
    }
  }

  async function handleFormSubmit(values: ExpenseFormValues) {
    await onSubmit({
      title: values.title,
      description: values.description || undefined,
      amount: values.amount,
      category: values.category,
      expenseType: values.expenseType,
      fundId: values.fundId ? Number(values.fundId) : undefined,
      payeeName: values.payeeName || undefined,
      department: values.department || undefined,
    });
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {serverError && <ErrorAlert message={serverError} />}

      <ol className="flex items-center gap-2 text-sm">
        {steps.map((label, index) => (
          <li key={label} className="flex items-center gap-2">
            {index > 0 && <span className="h-px w-6 bg-border" aria-hidden />}
            <span
              className={cn(
                "rounded-full px-2.5 py-1 text-xs font-medium",
                index === step
                  ? "bg-foreground text-background"
                  : index < step
                    ? "bg-muted text-foreground"
                    : "bg-muted/60 text-muted-foreground",
              )}
            >
              {index + 1}. {label}
            </span>
          </li>
        ))}
      </ol>

      {step === 0 ? (
        <FormSection
          title="What are you spending?"
          description="Title, amount, and category are enough to start."
        >
          <FormField label="Title" error={errors.title?.message} className="sm:col-span-2">
            <Input {...register("title")} placeholder="e.g. Office supplies" />
          </FormField>
          <FormField label="Amount" error={errors.amount?.message}>
            <Controller
              control={control}
              name="amount"
              render={({ field }) => (
                <CurrencyInput value={field.value} onChange={(v) => field.onChange(v === "" ? 0 : v)} />
              )}
            />
          </FormField>
          <FormField label="Category" error={errors.category?.message}>
            <select
              className="h-9 w-full rounded-md border border-input bg-surface px-2.5 text-sm"
              {...register("category")}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {formatEnumLabel(cat)}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Type" error={errors.expenseType?.message} className="sm:col-span-2">
            <select
              className="h-9 w-full rounded-md border border-input bg-surface px-2.5 text-sm"
              {...register("expenseType")}
            >
              {expenseTypes.map((type) => (
                <option key={type} value={type}>
                  {formatEnumLabel(type)}
                </option>
              ))}
            </select>
          </FormField>
        </FormSection>
      ) : (
        <FormSection
          title="Optional details"
          description="Fund, payee, and notes help finance review — skip if unknown."
        >
          <FormField label="Description" className="sm:col-span-2">
            <Input {...register("description")} placeholder="Optional description" />
          </FormField>
          <FormField label="Fund" className="sm:col-span-2">
            <Controller
              control={control}
              name="fundId"
              render={({ field }) => (
                <EntitySelector
                  value={field.value}
                  onChange={field.onChange}
                  options={fundOptions}
                  placeholder="Select fund (optional)..."
                />
              )}
            />
          </FormField>
          <FormField label="Payee">
            <Input {...register("payeeName")} />
          </FormField>
          <FormField label="Department">
            <Input {...register("department")} />
          </FormField>
        </FormSection>
      )}

      <div className="flex justify-end gap-2">
        {step === 0 ? (
          <>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button type="button" onClick={goNext}>
              Continue
            </Button>
          </>
        ) : (
          <>
            <Button type="button" variant="outline" onClick={() => setStep(0)}>
              Back
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving…" : submitLabel}
            </Button>
          </>
        )}
      </div>
    </form>
  );
}
