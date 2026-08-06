"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
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
import { cn } from "@/lib/utils";
import type { DonationCreateRequest } from "@/types/fundraising";

interface DonationFormProps {
  donorOptions: { id: string; label: string; description?: string }[];
  campaignOptions: { id: string; label: string; description?: string }[];
  defaultValues?: Partial<DonationFormValues>;
  serverError?: string | null;
  onSubmit: (values: DonationCreateRequest) => Promise<void>;
  onCancel?: () => void;
}

const steps = ["Gift details", "Optional details"] as const;

export function DonationForm({
  donorOptions,
  campaignOptions,
  defaultValues,
  serverError,
  onSubmit,
  onCancel,
}: DonationFormProps) {
  const [step, setStep] = useState(0);

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
    trigger,
    watch,
    formState: { errors, isSubmitting, isSubmitted },
  } = form;

  const anonymous = watch("anonymous");
  const donationType = watch("donationType");

  async function goNext() {
    const fields: (keyof DonationFormValues)[] = anonymous
      ? ["amount", "donationType", "anonymous"]
      : ["amount", "donationType", "anonymous", "donorId"];
    const valid = await trigger(fields);
    if (valid) {
      setStep(1);
    }
  }

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
          title="What was given?"
          description="Only the essentials — you can add campaign and notes next."
        >
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
        </FormSection>
      ) : (
        <FormSection
          title="Optional details"
          description="Campaign, source, and notes help reporting — skip if you do not need them."
        >
          <LookupField
            control={control}
            name="campaignId"
            label="Campaign"
            placeholder="Search campaigns (optional)..."
            options={campaignOptions}
            className="sm:col-span-2"
          />
          <TextField control={control} name="source" label="Source" placeholder="e.g. Online, Event, Mail" />
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
              <CurrencyField control={control} name="estimatedValue" label="Estimated value" allowEmpty />
            </>
          )}
        </FormSection>
      )}

      {step === 0 ? (
        <FormActions
          onCancel={onCancel}
          onNext={goNext}
          isLastStep={false}
          submitLabel="Continue"
          isSubmitting={isSubmitting}
        />
      ) : (
        <FormActions
          onCancel={() => setStep(0)}
          cancelLabel="Back"
          isSubmitting={isSubmitting}
          submitLabel="Record donation"
        />
      )}
    </FormContainer>
  );
}

export type { DonationFormValues };
