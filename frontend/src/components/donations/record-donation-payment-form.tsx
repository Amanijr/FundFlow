"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import {
  DonationPaymentFields,
  donationPaymentSchema,
  type DonationPaymentFormValues,
} from "@/components/donations/donation-payment-fields";
import { FormActions, FormContainer } from "@/components/forms";
import { ErrorAlert } from "@/components/feedback/error-alert";
import type { PaymentMethod } from "@/types/payment";

export interface LaterPaymentPayload {
  channel: "GATEWAY" | "MANUAL";
  paymentMethod: PaymentMethod;
  receiptNumber?: string;
  paymentNotes?: string;
}

interface RecordDonationPaymentFormProps {
  canRecordManual: boolean;
  serverError?: string | null;
  onSubmit: (values: LaterPaymentPayload) => Promise<void>;
  onCancel?: () => void;
}

export function RecordDonationPaymentForm({
  canRecordManual,
  serverError,
  onSubmit,
  onCancel,
}: RecordDonationPaymentFormProps) {
  const form = useForm<DonationPaymentFormValues>({
    resolver: zodResolver(donationPaymentSchema),
    defaultValues: {
      skipPayment: false,
      channel: canRecordManual ? "MANUAL" : "GATEWAY",
      paymentMethod: "CASH",
      receiptNumber: "",
      paymentNotes: "",
    },
  });

  async function handleSubmit(values: DonationPaymentFormValues) {
    await onSubmit({
      channel: values.channel,
      paymentMethod: values.paymentMethod,
      receiptNumber: values.receiptNumber || undefined,
      paymentNotes: values.paymentNotes || undefined,
    });
  }

  return (
    <FormContainer onSubmit={form.handleSubmit(handleSubmit)}>
      {serverError && <ErrorAlert message={serverError} />}
      <DonationPaymentFields
        form={form}
        canRecordManual={canRecordManual}
        allowSkip={false}
        title="Record payment"
        description="This completes the donation and posts cash to the ledger."
      />
      <FormActions
        onCancel={onCancel}
        isSubmitting={form.formState.isSubmitting}
        submitLabel="Record payment"
      />
    </FormContainer>
  );
}
