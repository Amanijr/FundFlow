"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { FormField } from "@/components/forms/form-field";
import { FormSection } from "@/components/forms/form-section";
import { ErrorAlert } from "@/components/feedback/error-alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { DonorRequest, MembershipStatus } from "@/types/fundraising";

const optionalText = (max: number) =>
  z
    .string()
    .max(max)
    .optional()
    .or(z.literal(""));

const donorSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(50),
  lastName: z.string().min(1, "Last name is required").max(50),
  memberNumber: z.string().max(32).optional().or(z.literal("")),
  email: z
    .string()
    .max(100)
    .refine((value) => !value || value.includes("@"), "Enter a valid email")
    .optional()
    .or(z.literal("")),
  phone: z.string().max(15).optional().or(z.literal("")),
  membershipStatus: z.enum(["ACTIVE", "INACTIVE", "VISITOR"]),
  notes: z.string().max(2000).optional().or(z.literal("")),
  address: optionalText(255),
  city: optionalText(100),
  state: optionalText(100),
  country: optionalText(100),
});

export type DonorFormValues = z.infer<typeof donorSchema>;

function emptyToUndefined(value?: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

interface DonorFormProps {
  defaultValues?: Partial<DonorFormValues>;
  submitLabel: string;
  serverError?: string | null;
  peopleNoun?: string;
  onSubmit: (values: DonorRequest) => Promise<void>;
  onCancel?: () => void;
}

const statusOptions: { value: MembershipStatus; label: string }[] = [
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
  { value: "VISITOR", label: "Visitor" },
];

export function DonorForm({
  defaultValues,
  submitLabel,
  serverError,
  peopleNoun = "person",
  onSubmit,
  onCancel,
}: DonorFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DonorFormValues>({
    resolver: zodResolver(donorSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      memberNumber: "",
      email: "",
      phone: "",
      membershipStatus: "ACTIVE",
      notes: "",
      address: "",
      city: "",
      state: "",
      country: "",
      ...defaultValues,
    },
  });

  return (
    <form
      onSubmit={handleSubmit((values) =>
        onSubmit({
          firstName: values.firstName,
          lastName: values.lastName,
          memberNumber: emptyToUndefined(values.memberNumber),
          email: emptyToUndefined(values.email),
          phone: emptyToUndefined(values.phone),
          membershipStatus: values.membershipStatus,
          notes: emptyToUndefined(values.notes),
          address: emptyToUndefined(values.address),
          city: emptyToUndefined(values.city),
          state: emptyToUndefined(values.state),
          country: emptyToUndefined(values.country),
        }),
      )}
      className="space-y-6"
    >
      {serverError && <ErrorAlert message={serverError} />}

      <FormSection title="Identity" description={`Who this ${peopleNoun} is`}>
        <FormField label="First name" error={errors.firstName?.message}>
          <Input {...register("firstName")} />
        </FormField>
        <FormField label="Last name" error={errors.lastName?.message}>
          <Input {...register("lastName")} />
        </FormField>
        {peopleNoun === "member" ? (
          <FormField
            label="Member number"
            error={errors.memberNumber?.message}
            className="sm:col-span-2"
          >
            <Input
              {...register("memberNumber")}
              placeholder="Leave blank to assign automatically (M-0001)"
            />
          </FormField>
        ) : null}
        <FormField label="Status" error={errors.membershipStatus?.message}>
          <select
            className="h-9 w-full rounded-md border border-input bg-surface px-2.5 text-sm"
            {...register("membershipStatus")}
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Notes" className="sm:col-span-2" error={errors.notes?.message}>
          <Input {...register("notes")} placeholder="Optional" />
        </FormField>
      </FormSection>

      <FormSection title="Contact" description="Optional — not everyone has email or a phone">
        <FormField label="Email" error={errors.email?.message}>
          <Input type="email" {...register("email")} />
        </FormField>
        <FormField label="Phone" error={errors.phone?.message}>
          <Input {...register("phone")} />
        </FormField>
      </FormSection>

      <FormSection title="Address" description="Optional mailing address">
        <FormField label="Street" className="sm:col-span-2">
          <Input {...register("address")} />
        </FormField>
        <FormField label="City">
          <Input {...register("city")} />
        </FormField>
        <FormField label="State">
          <Input {...register("state")} />
        </FormField>
        <FormField label="Country">
          <Input {...register("country")} />
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
