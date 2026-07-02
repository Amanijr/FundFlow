"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import {
  CheckboxField,
  CurrencyField,
  FormActions,
  FormContainer,
  FormSection,
  LookupField,
  SelectField,
  TextField,
  ValidationSummary,
} from "@/components/forms";
import {
  donationSchema,
  donationTypeOptions,
  type DonationFormValues,
} from "@/components/donations/donation.schema";
import { ErrorAlert } from "@/components/feedback/error-alert";
import type { DonationCreateRequest } from "@/types/fundraising";

interface DonationFormProps {
  donorOptions: { id: string; label: string; description?: string }[];
  campaignOptions: { id: string; label: string; description?: string }[];
  defaultValues?: Partial<DonationFormValues>;
  serverError?: string | null;
  onSubmit: (values: DonationCreateRequest) => Promise<void>;
  onCancel?: () => void;
}

export function DonationForm({
  donorOptions,
  campaignOptions,
  defaultValues,
  serverError,
  onSubmit,
  onCancel,
}: DonationFormProps) {
  const form = useForm<DonationFormValues>({
    resolver: zodResolver(donationSchema),
    defaultValues: {
      donorId: "",
      amount: 0,
      donationType: "ONE_TIME",
      anonymous: false,
      campaignId: "",
      source: "",
      notes: "",
      ...defaultValues,
    },
  });

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting, isSubmitted },
  } = form;

  const anonymous = watch("anonymous");
  const donationType = watch("donationType");

  async function handleFormSubmit(values: DonationFormValues) {
    await onSubmit({
      donorId: values.donorId ? Number(values.donorId) : undefined,
      amount: values.amount,
      donationType: values.donationType,
      anonymous: values.anonymous,
      campaignId: values.campaignId ? Number(values.campaignId) : undefined,
      source: values.source || undefined,
      notes: values.notes || undefined,
      itemDescription: values.itemDescription || undefined,
      estimatedValue: values.estimatedValue,
    });
  }

  return (
    <FormContainer onSubmit={handleSubmit(handleFormSubmit)}>
      {serverError && <ErrorAlert message={serverError} />}
      {isSubmitted && Object.keys(errors).length > 0 && <ValidationSummary errors={errors} />}

      <FormSection title="Donation details" description="Link a donor, campaign, and gift amount">
        <CheckboxField
          control={control}
          name="anonymous"
          label="Anonymous gift"
          checkboxLabel="Record without identifying the donor"
          className="sm:col-span-2"
        />

        {!anonymous && (
          <LookupField
            control={control}
            name="donorId"
            label="Donor"
            placeholder="Search donors..."
            options={donorOptions}
            required
            className="sm:col-span-2"
          />
        )}

        <LookupField
          control={control}
          name="campaignId"
          label="Campaign"
          placeholder="Search campaigns (optional)..."
          options={campaignOptions}
          className="sm:col-span-2"
        />

        <CurrencyField control={control} name="amount" label="Amount" required />

        <SelectField
          control={control}
          name="donationType"
          label="Type"
          options={donationTypeOptions.map((option) => ({
            value: option.value,
            label: option.label,
          }))}
          required
        />

        <TextField
          control={control}
          name="source"
          label="Source"
          placeholder="e.g. Online, Event, Mail"
        />

        <TextField
          control={control}
          name="notes"
          label="Notes"
          placeholder="Optional note"
          className="sm:col-span-2"
        />

        {donationType === "IN_KIND" && (
          <>
            <TextField
              control={control}
              name="itemDescription"
              label="Item description"
              className="sm:col-span-2"
            />
            <CurrencyField
              control={control}
              name="estimatedValue"
              label="Estimated value"
              allowEmpty
            />
          </>
        )}
      </FormSection>

      <FormActions onCancel={onCancel} isSubmitting={isSubmitting} submitLabel="Record donation" />
    </FormContainer>
  );
}

export type { DonationFormValues };
