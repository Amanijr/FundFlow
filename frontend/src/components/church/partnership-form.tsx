"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { FormField } from "@/components/forms/form-field";
import { FormSection } from "@/components/forms/form-section";
import { ErrorAlert } from "@/components/feedback/error-alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { PartnershipRequest, PartnershipStatus } from "@/types/verticals";

const partnershipSchema = z.object({
  memberId: z.string().min(1, "Member is required"),
  fundId: z.string().optional(),
  monthlyAmount: z.coerce.number().positive("Monthly amount must be greater than zero"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  status: z.enum(["ACTIVE", "PAUSED", "ENDED"]),
  notes: z.string().max(2000).optional(),
});

export type PartnershipFormValues = z.infer<typeof partnershipSchema>;

interface PartnershipFormProps {
  memberOptions: { id: string; label: string }[];
  fundOptions: { id: string; label: string }[];
  defaultValues?: Partial<PartnershipFormValues>;
  lockMember?: boolean;
  submitLabel: string;
  serverError?: string | null;
  onSubmit: (values: PartnershipRequest) => Promise<void>;
  onCancel?: () => void;
}

export function PartnershipForm({
  memberOptions,
  fundOptions,
  defaultValues,
  lockMember = false,
  submitLabel,
  serverError,
  onSubmit,
  onCancel,
}: PartnershipFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PartnershipFormValues>({
    resolver: zodResolver(partnershipSchema),
    defaultValues: {
      memberId: "",
      fundId: "",
      monthlyAmount: 0,
      startDate: new Date().toISOString().slice(0, 10),
      endDate: "",
      status: "ACTIVE",
      notes: "",
      ...defaultValues,
    },
  });

  async function handleFormSubmit(values: PartnershipFormValues) {
    await onSubmit({
      memberId: Number(values.memberId),
      fundId: values.fundId ? Number(values.fundId) : undefined,
      monthlyAmount: values.monthlyAmount,
      startDate: values.startDate,
      endDate: values.endDate || undefined,
      status: values.status as PartnershipStatus,
      notes: values.notes || undefined,
    });
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {serverError && <ErrorAlert message={serverError} />}

      <FormSection
        title="Monthly partnership"
        description="The amount this member promised each calendar month. Gifts count toward that month as they are recorded."
      >
        <FormField label="Member" error={errors.memberId?.message} className="sm:col-span-2">
          <select
            {...register("memberId")}
            disabled={lockMember}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">Select member</option>
            {memberOptions.map((member) => (
              <option key={member.id} value={member.id}>
                {member.label}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Monthly amount (TZS)" error={errors.monthlyAmount?.message}>
          <Input type="number" min="0.01" step="0.01" {...register("monthlyAmount")} />
        </FormField>
        <FormField label="Fund" error={errors.fundId?.message}>
          <select
            {...register("fundId")}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">Any fund</option>
            {fundOptions.map((fund) => (
              <option key={fund.id} value={fund.id}>
                {fund.label}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Start date" error={errors.startDate?.message}>
          <Input type="date" {...register("startDate")} />
        </FormField>
        <FormField label="End date" error={errors.endDate?.message}>
          <Input type="date" {...register("endDate")} />
        </FormField>
        <FormField label="Status" error={errors.status?.message}>
          <select
            {...register("status")}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="ACTIVE">Active</option>
            <option value="PAUSED">Paused</option>
            <option value="ENDED">Ended</option>
          </select>
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
