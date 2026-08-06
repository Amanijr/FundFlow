"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";

import {
  CheckboxField,
  CurrencyField,
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
import { LoadingState } from "@/components/feedback/loading-state";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { listCampaigns } from "@/lib/api/campaigns";
import { createDonation } from "@/lib/api/donations";
import { listDonors } from "@/lib/api/donors";
import { processGatewayPayment, recordManualPayment } from "@/lib/api/payments";
import { useSessionPreferencesStore } from "@/stores/session-preferences-store";
import { ApiError } from "@/types/api";
import type { PaymentMethod } from "@/types/payment";
import { cn } from "@/lib/utils";

const steps = ["Gift", "Details", "Payment"] as const;

const paymentSchema = z.object({
  channel: z.enum(["GATEWAY", "MANUAL"]),
  paymentMethod: z.enum(["CASH", "BANK_TRANSFER", "MOBILE_MONEY", "CARD", "CHEQUE"]),
  receiptNumber: z.string().optional(),
  paymentNotes: z.string().optional(),
  skipPayment: z.boolean(),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

const paymentMethodOptions: { value: PaymentMethod; label: string }[] = [
  { value: "MOBILE_MONEY", label: "Mobile money" },
  { value: "CARD", label: "Card" },
  { value: "CASH", label: "Cash" },
  { value: "BANK_TRANSFER", label: "Bank transfer" },
  { value: "CHEQUE", label: "Cheque" },
];

export function ReceiveGiftWizard() {
  const router = useRouter();
  const { accessToken, user } = useAuth();
  const [step, setStep] = useState(0);
  const [serverError, setServerError] = useState<string | null>(null);
  const lastCampaignId = useSessionPreferencesStore((state) => state.lastCampaignId);
  const setLastCampaignId = useSessionPreferencesStore((state) => state.setLastCampaignId);

  const donorsQuery = useQuery({
    queryKey: ["donors"],
    queryFn: async () => (await listDonors(accessToken!)).data,
    enabled: Boolean(accessToken),
  });

  const campaignsQuery = useQuery({
    queryKey: ["campaigns"],
    queryFn: async () => (await listCampaigns(accessToken!)).data,
    enabled: Boolean(accessToken),
  });

  const donorOptions = useMemo(
    () =>
      (donorsQuery.data ?? []).map((donor) => ({
        id: String(donor.id),
        label: `${donor.firstName} ${donor.lastName}`,
        description: donor.email,
      })),
    [donorsQuery.data],
  );

  const campaignOptions = useMemo(
    () =>
      (campaignsQuery.data ?? []).map((campaign) => ({
        id: String(campaign.id),
        label: campaign.name,
        description: campaign.status.replaceAll("_", " "),
      })),
    [campaignsQuery.data],
  );

  const giftForm = useForm<DonationFormValues>({
    resolver: zodResolver(donationSchema),
    defaultValues: {
      donorId: "",
      amount: 0,
      donationType: "ONE_TIME",
      anonymous: false,
      campaignId: lastCampaignId ?? "",
      source: "",
      notes: "",
    },
  });

  const paymentForm = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      channel: "GATEWAY",
      paymentMethod: "MOBILE_MONEY",
      receiptNumber: "",
      paymentNotes: "",
      skipPayment: false,
    },
  });

  const anonymous = giftForm.watch("anonymous");
  const channel = paymentForm.watch("channel");
  const skipPayment = paymentForm.watch("skipPayment");
  const canRecordManual =
    user?.role === "ORG_ADMIN" || user?.role === "FINANCE_MANAGER";

  async function goToDetails() {
    const fields: (keyof DonationFormValues)[] = anonymous
      ? ["amount", "donationType", "anonymous"]
      : ["amount", "donationType", "anonymous", "donorId"];
    if (await giftForm.trigger(fields)) {
      setStep(1);
    }
  }

  async function goToPayment() {
    setStep(2);
  }

  async function finish() {
    setServerError(null);
    const giftValid = await giftForm.trigger();
    const paymentValid = skipPayment ? true : await paymentForm.trigger();
    if (!giftValid || !paymentValid) {
      return;
    }

    const gift = giftForm.getValues();
    const payment = paymentForm.getValues();

    try {
      const created = await createDonation(accessToken!, {
        donorId: gift.donorId ? Number(gift.donorId) : undefined,
        amount: gift.amount,
        donationType: gift.donationType,
        anonymous: gift.anonymous,
        campaignId: gift.campaignId ? Number(gift.campaignId) : undefined,
        source: gift.source || undefined,
        notes: gift.notes || undefined,
        itemDescription: gift.itemDescription || undefined,
        estimatedValue: gift.estimatedValue,
      });

      if (gift.campaignId) {
        setLastCampaignId(gift.campaignId);
      }

      if (!payment.skipPayment && gift.donationType !== "IN_KIND") {
        if (payment.channel === "GATEWAY") {
          await processGatewayPayment(accessToken!, created.data.id, {
            paymentMethod: payment.paymentMethod,
          });
        } else {
          if (!canRecordManual) {
            throw new Error("Only finance managers can record manual payments");
          }
          await recordManualPayment(accessToken!, created.data.id, {
            paymentMethod: payment.paymentMethod,
            receiptNumber: payment.receiptNumber || `RCP-${Date.now()}`,
            collectionDate: new Date().toISOString(),
            paymentNotes: payment.paymentNotes || undefined,
          });
        }
        toast.success("Gift received and payment recorded");
      } else {
        toast.success("Gift recorded — payment still pending");
      }

      router.push(`/donations/${created.data.id}`);
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : err instanceof Error ? err.message : "Unable to finish gift");
    }
  }

  if (donorsQuery.isLoading || campaignsQuery.isLoading) {
    return <LoadingState />;
  }

  if (donorsQuery.isError || campaignsQuery.isError) {
    return <ErrorAlert message="Unable to load donors or campaigns." />;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <PageHeader
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Receive a gift" }]}
        title="Receive a gift"
        description="Guided flow: gift details → optional info → payment."
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

      {step === 0 && (
        <FormContainer onSubmit={giftForm.handleSubmit(goToDetails)}>
          {Object.keys(giftForm.formState.errors).length > 0 && (
            <ValidationSummary errors={giftForm.formState.errors} />
          )}
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
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => router.push("/")}>
              Cancel
            </Button>
            <Button type="submit">Continue</Button>
          </div>
        </FormContainer>
      )}

      {step === 1 && (
        <FormContainer onSubmit={giftForm.handleSubmit(goToPayment)}>
          <FormSection
            title="Optional details"
            description="Campaign defaults to the last one you used."
          >
            <LookupField
              control={giftForm.control}
              name="campaignId"
              label="Campaign"
              placeholder="Search campaigns (optional)..."
              options={campaignOptions}
              className="sm:col-span-2"
            />
            <TextField
              control={giftForm.control}
              name="source"
              label="Source"
              placeholder="e.g. Online, Event, Mail"
            />
            <TextField
              control={giftForm.control}
              name="notes"
              label="Notes"
              placeholder="Optional note"
              className="sm:col-span-2"
            />
          </FormSection>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setStep(0)}>
              Back
            </Button>
            <Button type="submit">Continue to payment</Button>
          </div>
        </FormContainer>
      )}

      {step === 2 && (
        <FormContainer onSubmit={paymentForm.handleSubmit(finish)}>
          <FormSection
            title="Record payment"
            description="Complete the gift now, or leave it pending for finance."
          >
            <CheckboxField
              control={paymentForm.control}
              name="skipPayment"
              label="Skip for now"
              checkboxLabel="Save the gift as pending — finance can take payment later"
              className="sm:col-span-2"
            />

            {!skipPayment && (
              <>
                <div className="sm:col-span-2 space-y-2">
                  <Label>Payment channel</Label>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant={channel === "GATEWAY" ? "default" : "outline"}
                      onClick={() => paymentForm.setValue("channel", "GATEWAY")}
                    >
                      Online / gateway
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={channel === "MANUAL" ? "default" : "outline"}
                      disabled={!canRecordManual}
                      onClick={() => paymentForm.setValue("channel", "MANUAL")}
                    >
                      Cash / cheque (manual)
                    </Button>
                  </div>
                  {!canRecordManual && (
                    <p className="text-xs text-muted-foreground">
                      Manual cash/cheque recording is limited to finance managers.
                    </p>
                  )}
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <Label htmlFor="paymentMethod">Method</Label>
                  <select
                    id="paymentMethod"
                    className="h-9 w-full rounded-md border border-input bg-surface px-2.5 text-sm"
                    {...paymentForm.register("paymentMethod")}
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
                        {...paymentForm.register("receiptNumber")}
                      />
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label htmlFor="paymentNotes">Payment notes</Label>
                      <Input id="paymentNotes" {...paymentForm.register("paymentNotes")} />
                    </div>
                  </>
                )}
              </>
            )}
          </FormSection>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button type="submit" disabled={giftForm.formState.isSubmitting || paymentForm.formState.isSubmitting}>
              {paymentForm.formState.isSubmitting ? "Finishing…" : "Finish"}
            </Button>
          </div>
        </FormContainer>
      )}
    </div>
  );
}
