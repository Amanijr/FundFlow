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
import {
  DonationPaymentFields,
  donationPaymentSchema,
  type DonationPaymentFormValues,
} from "@/components/donations/donation-payment-fields";
import { ErrorAlert } from "@/components/feedback/error-alert";
import { cn } from "@/lib/utils";
import type { DonationCreateRequest } from "@/types/fundraising";
import type { PaymentMethod } from "@/types/payment";

export interface DonationIntakePayload {
  donation: DonationCreateRequest;
  payment?: {
    skip: boolean;
    channel: "GATEWAY" | "MANUAL";
    paymentMethod: PaymentMethod;
    receiptNumber?: string;
    paymentNotes?: string;
  };
}

interface DonationFormProps {
  donorOptions: { id: string; label: string; description?: string }[];
  campaignOptions: { id: string; label: string; description?: string }[];
  fundOptions?: { id: string; label: string; description?: string }[];
  defaultValues?: Partial<DonationFormValues>;
  serverError?: string | null;
  canRecordManual?: boolean;
  onSubmit: (values: DonationIntakePayload) => Promise<void>;
  onCancel?: () => void;
}

const steps = ["Gift", "Details", "Payment"] as const;

export function DonationForm({
  donorOptions,
  campaignOptions,
  fundOptions = [],
  defaultValues,
  serverError,
  canRecordManual = false,
  onSubmit,
  onCancel,
}: DonationFormProps) {
  const [step, setStep] = useState(0);

  const giftForm = useForm<DonationFormValues>({
    resolver: zodResolver(donationSchema),
    defaultValues: {
      donorId: "",
      amount: 0,
      donationType: "ONE_TIME",
      anonymous: false,
      campaignId: "",
      fundId: "",
      source: "",
      notes: "",
      ...defaultValues,
    },
  });

  const paymentForm = useForm<DonationPaymentFormValues>({
    resolver: zodResolver(donationPaymentSchema),
    defaultValues: {
      skipPayment: false,
      channel: canRecordManual ? "MANUAL" : "GATEWAY",
      paymentMethod: "CASH",
      receiptNumber: "",
      paymentNotes: "",
    },
  });

  const anonymous = giftForm.watch("anonymous");
  const donationType = giftForm.watch("donationType");
  const skipPayment = paymentForm.watch("skipPayment");
  const isSubmitting = giftForm.formState.isSubmitting || paymentForm.formState.isSubmitting;

  async function goToDetails() {
    const fields: (keyof DonationFormValues)[] = anonymous
      ? ["amount", "donationType", "anonymous"]
      : ["amount", "donationType", "anonymous", "donorId"];
    if (await giftForm.trigger(fields)) {
      setStep(1);
    }
  }

  async function goToPayment() {
    if (donationType === "IN_KIND") {
      await finish();
      return;
    }
    setStep(2);
  }

  async function finish() {
    const giftValid = await giftForm.trigger();
    const needsPayment = donationType !== "IN_KIND";
    const paymentValid = !needsPayment || skipPayment ? true : await paymentForm.trigger();
    if (!giftValid || !paymentValid) {
      return;
    }

    const gift = giftForm.getValues();
    const payment = paymentForm.getValues();

    await onSubmit({
      donation: {
        donorId: gift.donorId ? Number(gift.donorId) : undefined,
        amount: gift.amount,
        donationType: gift.donationType,
        anonymous: gift.anonymous,
        campaignId: gift.campaignId ? Number(gift.campaignId) : undefined,
        fundId: gift.fundId ? Number(gift.fundId) : undefined,
        source: gift.source || undefined,
        notes: gift.notes || undefined,
        itemDescription: gift.itemDescription || undefined,
        estimatedValue: gift.estimatedValue,
      },
      payment: needsPayment
        ? {
            skip: payment.skipPayment,
            channel: payment.channel,
            paymentMethod: payment.paymentMethod,
            receiptNumber: payment.receiptNumber || undefined,
            paymentNotes: payment.paymentNotes || undefined,
          }
        : undefined,
    });
  }

  return (
    <FormContainer
      onSubmit={
        step === 0
          ? giftForm.handleSubmit(goToDetails)
          : step === 1
            ? giftForm.handleSubmit(goToPayment)
            : paymentForm.handleSubmit(finish)
      }
    >
      {serverError && <ErrorAlert message={serverError} />}
      {giftForm.formState.isSubmitted && Object.keys(giftForm.formState.errors).length > 0 && (
        <ValidationSummary errors={giftForm.formState.errors} />
      )}

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

      {step === 0 && (
        <FormSection title="What was given?" description="Amount, type, and who gave.">
          <CurrencyField control={giftForm.control} name="amount" label="Amount" required />
          <SelectField
            control={giftForm.control}
            name="donationType"
            label="Type"
            options={donationTypeOptions.map((option) => ({
              value: option.value,
              label: option.label,
            }))}
            required
          />
          <CheckboxField
            control={giftForm.control}
            name="anonymous"
            label="Anonymous gift"
            checkboxLabel="Record without identifying the donor"
            className="sm:col-span-2"
          />
          {!anonymous && (
            <LookupField
              control={giftForm.control}
              name="donorId"
              label="Donor"
              placeholder="Search donors..."
              options={donorOptions}
              required
              className="sm:col-span-2"
            />
          )}
        </FormSection>
      )}

      {step === 1 && (
        <FormSection
          title="Optional details"
          description="Fund tells the ledger whether this is zaka, sadaka, or building. Campaign is optional."
        >
          <LookupField
            control={giftForm.control}
            name="campaignId"
            label="Campaign"
            placeholder="Search campaigns (optional)..."
            options={campaignOptions}
            className="sm:col-span-2"
          />
          <LookupField
            control={giftForm.control}
            name="fundId"
            label="Fund"
            placeholder="Tithe, offering, building..."
            options={fundOptions}
            className="sm:col-span-2"
          />
          <TextField
            control={giftForm.control}
            name="source"
            label="Source"
            placeholder="e.g. Sunday service, Lipa, Event"
          />
          <TextField
            control={giftForm.control}
            name="notes"
            label="Notes"
            placeholder="Optional note"
            className="sm:col-span-2"
          />
          {donationType === "IN_KIND" && (
            <>
              <TextField
                control={giftForm.control}
                name="itemDescription"
                label="Item description"
                className="sm:col-span-2"
              />
              <CurrencyField control={giftForm.control} name="estimatedValue" label="Estimated value" allowEmpty />
            </>
          )}
        </FormSection>
      )}

      {step === 2 && (
        <DonationPaymentFields form={paymentForm} canRecordManual={canRecordManual} />
      )}

      {step === 0 ? (
        <FormActions
          onCancel={onCancel}
          onNext={goToDetails}
          isLastStep={false}
          submitLabel="Continue"
          isSubmitting={isSubmitting}
        />
      ) : step === 1 ? (
        <FormActions
          onCancel={() => setStep(0)}
          cancelLabel="Back"
          onNext={goToPayment}
          isLastStep={donationType === "IN_KIND"}
          submitLabel={donationType === "IN_KIND" ? "Save donation" : "Continue to payment"}
          isSubmitting={isSubmitting}
        />
      ) : (
        <FormActions
          onCancel={() => setStep(1)}
          cancelLabel="Back"
          isSubmitting={isSubmitting}
          submitLabel={skipPayment ? "Save as pending" : "Save donation"}
        />
      )}
    </FormContainer>
  );
}

export type { DonationFormValues };
