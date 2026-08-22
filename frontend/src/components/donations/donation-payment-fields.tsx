"use client";

import type { UseFormReturn } from "react-hook-form";
import { z } from "zod";

import { CheckboxField, FormSection } from "@/components/forms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { PaymentMethod } from "@/types/payment";

export const donationPaymentSchema = z.object({
  skipPayment: z.boolean(),
  channel: z.enum(["GATEWAY", "MANUAL"]),
  paymentMethod: z.enum(["CASH", "BANK_TRANSFER", "MOBILE_MONEY", "CARD", "CHEQUE"]),
  receiptNumber: z.string().optional(),
  paymentNotes: z.string().optional(),
});

export type DonationPaymentFormValues = z.infer<typeof donationPaymentSchema>;

const paymentMethodOptions: { value: PaymentMethod; label: string }[] = [
  { value: "CASH", label: "Cash" },
  { value: "MOBILE_MONEY", label: "Mobile money / Lipa" },
  { value: "BANK_TRANSFER", label: "Bank transfer" },
  { value: "CHEQUE", label: "Cheque" },
  { value: "CARD", label: "Card" },
];

interface DonationPaymentFieldsProps {
  form: UseFormReturn<DonationPaymentFormValues>;
  canRecordManual: boolean;
  allowSkip?: boolean;
  title?: string;
  description?: string;
}

export function DonationPaymentFields({
  form,
  canRecordManual,
  allowSkip = true,
  title = "Payment",
  description = "Cash and Lipa are recorded here. Skip only if money has not arrived yet.",
}: DonationPaymentFieldsProps) {
  const channel = form.watch("channel");
  const skipPayment = form.watch("skipPayment");

  return (
    <FormSection title={title} description={description}>
      {allowSkip && (
        <CheckboxField
          control={form.control}
          name="skipPayment"
          label="Pay later"
          checkboxLabel="Save as pending — treasurer can record cash or Lipa on this donation later"
          className="sm:col-span-2"
        />
      )}

      {!skipPayment && (
        <>
          <div className="sm:col-span-2 space-y-2">
            <Label>How was it paid?</Label>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                variant={channel === "MANUAL" ? "default" : "outline"}
                disabled={!canRecordManual}
                onClick={() => form.setValue("channel", "MANUAL")}
              >
                Cash / Lipa / bank (manual)
              </Button>
              <Button
                type="button"
                size="sm"
                variant={channel === "GATEWAY" ? "default" : "outline"}
                onClick={() => form.setValue("channel", "GATEWAY")}
              >
                Online / gateway
              </Button>
            </div>
            {!canRecordManual && (
              <p className="text-xs text-muted-foreground">
                Only the treasurer or org admin can confirm cash, Lipa, or bank. You can save as pending.
              </p>
            )}
          </div>

          <div className="sm:col-span-2 space-y-1.5">
            <Label htmlFor="paymentMethod">Method</Label>
            <select
              id="paymentMethod"
              className="h-9 w-full rounded-md border border-input bg-surface px-2.5 text-sm"
              {...form.register("paymentMethod")}
            >
              {paymentMethodOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {channel === "MANUAL" && (
            <>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="receiptNumber">Receipt number</Label>
                <Input
                  id="receiptNumber"
                  placeholder="Optional — auto-generated if blank"
                  {...form.register("receiptNumber")}
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="paymentNotes">Payment notes</Label>
                <Input id="paymentNotes" {...form.register("paymentNotes")} />
              </div>
            </>
          )}
        </>
      )}
    </FormSection>
  );
}
