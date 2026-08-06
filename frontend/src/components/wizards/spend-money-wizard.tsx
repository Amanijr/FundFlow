"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";

import { CurrencyInput } from "@/components/forms/currency-input";
import { EntitySelector } from "@/components/forms/entity-selector";
import { FormField } from "@/components/forms/form-field";
import { FormSection } from "@/components/forms/form-section";
import { ErrorAlert } from "@/components/feedback/error-alert";
import { LoadingState } from "@/components/feedback/loading-state";
import { formatEnumLabel } from "@/components/finance/finance-status-badge";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { createExpense, submitExpense } from "@/lib/api/expenses";
import { listFunds } from "@/lib/api/funds";
import { useSessionPreferencesStore } from "@/stores/session-preferences-store";
import { ApiError } from "@/types/api";
import type { ExpenseCategory, ExpenseType } from "@/types/finance";
import { cn } from "@/lib/utils";

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
  submitForApproval: z.boolean(),
});

type SpendFormValues = z.infer<typeof expenseSchema>;

const steps = ["Spending", "Details", "Submit"] as const;

export function SpendMoneyWizard() {
  const router = useRouter();
  const { accessToken } = useAuth();
  const [step, setStep] = useState(0);
  const [serverError, setServerError] = useState<string | null>(null);
  const lastFundId = useSessionPreferencesStore((state) => state.lastFundId);
  const setLastFundId = useSessionPreferencesStore((state) => state.setLastFundId);

  const fundsQuery = useQuery({
    queryKey: ["funds"],
    queryFn: async () => (await listFunds(accessToken!)).data,
    enabled: Boolean(accessToken),
  });

  const fundOptions = useMemo(
    () => (fundsQuery.data ?? []).map((f) => ({ id: String(f.id), label: f.name, description: f.code })),
    [fundsQuery.data],
  );

  const form = useForm<SpendFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      title: "",
      description: "",
      amount: 0,
      category: "OPERATIONS",
      expenseType: "REQUEST",
      fundId: lastFundId ?? "",
      payeeName: "",
      department: "",
      submitForApproval: true,
    },
  });

  const {
    register,
    control,
    handleSubmit,
    trigger,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = form;

  const submitForApproval = watch("submitForApproval");

  async function goToDetails() {
    if (await trigger(["title", "amount", "category", "expenseType"])) {
      setStep(1);
    }
  }

  async function goToSubmit() {
    setStep(2);
  }

  async function finish(values: SpendFormValues) {
    setServerError(null);
    try {
      const created = await createExpense(accessToken!, {
        title: values.title,
        description: values.description || undefined,
        amount: values.amount,
        category: values.category,
        expenseType: values.expenseType,
        fundId: values.fundId ? Number(values.fundId) : undefined,
        payeeName: values.payeeName || undefined,
        department: values.department || undefined,
      });

      if (values.fundId) {
        setLastFundId(values.fundId);
      }

      if (values.submitForApproval) {
        await submitExpense(accessToken!, created.data.id);
        toast.success("Expense submitted for approval");
      } else {
        toast.success("Expense saved as draft");
      }

      router.push(`/expenses/${created.data.id}`);
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : "Unable to finish expense");
    }
  }

  if (fundsQuery.isLoading) {
    return <LoadingState />;
  }

  if (fundsQuery.isError) {
    return <ErrorAlert message="Unable to load funds." />;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <PageHeader
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Spend money" }]}
        title="Spend money"
        description="Guided flow: spending details → optional info → submit for approval."
      />

      <ol className="flex flex-wrap items-center gap-2 text-sm">
        {steps.map((label, index) => (
          <li key={label} className="flex items-center gap-2">
            {index > 0 && <span className="h-px w-5 bg-border" aria-hidden />}
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

      {serverError && <ErrorAlert message={serverError} />}

      <form onSubmit={handleSubmit(finish)} className="space-y-6">
        {step === 0 && (
          <FormSection title="What are you spending?" description="Title, amount, and category.">
            <FormField label="Title" error={errors.title?.message} className="sm:col-span-2">
              <Input {...register("title")} placeholder="e.g. Office supplies" />
            </FormField>
            <FormField label="Amount" error={errors.amount?.message}>
              <Controller
                control={control}
                name="amount"
                render={({ field }) => (
                  <CurrencyInput
                    value={field.value}
                    onChange={(v) => field.onChange(v === "" ? 0 : v)}
                  />
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
        )}

        {step === 1 && (
          <FormSection
            title="Optional details"
            description="Fund defaults to the last one you used."
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

        {step === 2 && (
          <FormSection
            title="Ready to submit?"
            description="Send it for approval now, or keep it as a draft."
          >
            <div className="sm:col-span-2 rounded-lg border border-border bg-muted/30 p-4 text-sm">
              <p className="font-medium text-foreground">{watch("title") || "Untitled expense"}</p>
              <p className="mt-1 text-muted-foreground">
                Amount: {watch("amount") || 0} · {formatEnumLabel(watch("category"))} ·{" "}
                {formatEnumLabel(watch("expenseType"))}
              </p>
              {watch("fundId") && (
                <p className="mt-1 text-muted-foreground">
                  Fund: {fundOptions.find((f) => f.id === watch("fundId"))?.label ?? watch("fundId")}
                </p>
              )}
            </div>
            <div className="flex items-start gap-3 sm:col-span-2">
              <Checkbox
                id="submitForApproval"
                checked={submitForApproval}
                onCheckedChange={(checked) => setValue("submitForApproval", checked === true)}
              />
              <div className="space-y-1">
                <Label htmlFor="submitForApproval">Submit for approval now</Label>
                <p className="text-sm text-muted-foreground">
                  Recommended. Finance can approve and pay from the Approvals inbox.
                </p>
              </div>
            </div>
          </FormSection>
        )}

        <div className="flex justify-end gap-2">
          {step === 0 ? (
            <Button type="button" variant="outline" onClick={() => router.push("/")}>
              Cancel
            </Button>
          ) : (
            <Button type="button" variant="outline" onClick={() => setStep((value) => value - 1)}>
              Back
            </Button>
          )}
          {step < 2 ? (
            <Button type="button" onClick={step === 0 ? goToDetails : goToSubmit}>
              Continue
            </Button>
          ) : (
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Finishing…" : "Finish"}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
