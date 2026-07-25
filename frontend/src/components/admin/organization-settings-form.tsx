"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { FormField } from "@/components/forms/form-field";
import { FormSection } from "@/components/forms/form-section";
import { ErrorAlert } from "@/components/feedback/error-alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { OrganizationType } from "@/types/api";
import type { OrganizationUpdateRequest } from "@/types/admin";

const organizationTypes: OrganizationType[] = [
  "CHURCH",
  "NGO",
  "FOUNDATION",
  "CHARITY",
  "COMMUNITY_ORGANIZATION",
  "SCHOOL",
  "RELIGIOUS_INSTITUTION",
];

const schema = z.object({
  name: z.string().min(2, "Name is required"),
  type: z.enum([
    "CHURCH",
    "NGO",
    "FOUNDATION",
    "CHARITY",
    "COMMUNITY_ORGANIZATION",
    "SCHOOL",
    "RELIGIOUS_INSTITUTION",
  ]),
  email: z.string().email("Enter a valid email").optional().or(z.literal("")),
  phone: z.string().max(20).optional(),
  address: z.string().max(255).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
});

export type OrganizationSettingsFormValues = z.infer<typeof schema>;

interface OrganizationSettingsFormProps {
  defaultValues?: Partial<OrganizationSettingsFormValues>;
  serverError?: string | null;
  submitLabel?: string;
  onSubmit: (values: OrganizationUpdateRequest) => Promise<void>;
}

export function OrganizationSettingsForm({
  defaultValues,
  serverError,
  submitLabel = "Save changes",
  onSubmit,
}: OrganizationSettingsFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<OrganizationSettingsFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      type: "NGO",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      country: "",
      ...defaultValues,
    },
  });

  async function handleFormSubmit(values: OrganizationSettingsFormValues) {
    await onSubmit({
      name: values.name,
      type: values.type,
      email: values.email || undefined,
      phone: values.phone || undefined,
      address: values.address || undefined,
      city: values.city || undefined,
      state: values.state || undefined,
      country: values.country || undefined,
    });
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {serverError && <ErrorAlert message={serverError} />}

      <FormSection title="Organization profile" description="Public-facing organization details">
        <FormField label="Name" error={errors.name?.message} className="sm:col-span-2">
          <Input {...register("name")} />
        </FormField>
        <FormField label="Type" error={errors.type?.message}>
          <select
            className="h-9 w-full rounded-md border border-input bg-surface px-2.5 text-sm"
            {...register("type")}
          >
            {organizationTypes.map((type) => (
              <option key={type} value={type}>
                {type.replaceAll("_", " ")}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Email" error={errors.email?.message}>
          <Input type="email" {...register("email")} />
        </FormField>
        <FormField label="Phone">
          <Input {...register("phone")} />
        </FormField>
        <FormField label="Address" className="sm:col-span-2">
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

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
