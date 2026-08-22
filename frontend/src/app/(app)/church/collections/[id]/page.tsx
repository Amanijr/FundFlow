"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { ChurchNav } from "@/components/church/church-nav";
import { CollectionStatusBadge } from "@/components/church/collection-status-badge";
import { DateInput } from "@/components/forms/date-input";
import { FormField } from "@/components/forms/form-field";
import { FormSection } from "@/components/forms/form-section";
import { DetailCard } from "@/components/display/detail-card";
import { ErrorAlert } from "@/components/feedback/error-alert";
import { LoadingState } from "@/components/feedback/loading-state";
import { PageHeader } from "@/components/layout/page-header";
import { PermissionGate } from "@/components/security/permission-gate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { WorkflowStepper } from "@/components/workflow/workflow-stepper";
import { useAuth } from "@/hooks/use-auth";
import {
  depositCollectionSession,
  getCollectionSession,
  submitCollectionCount,
  verifyCollectionSession,
} from "@/lib/api/collections";
import {
  CHURCH_PAYMENT_LABELS,
  churchPaymentLabel,
  collectionStatusLabel,
  collectionTypeLabel,
} from "@/lib/church/labels";
import { formatCurrency, toNumber } from "@/lib/utils/format";
import { formatDate, formatDateTime } from "@/lib/utils/dates";
import { ApiError } from "@/types/api";
import type { PaymentMethod } from "@/types/finance";

const collectionSteps = ["DRAFT", "COUNTED", "VERIFIED", "DEPOSITED"] as const;

const countSchema = z.object({
  totalAmount: z.number().positive("Enter the counted amount"),
  paymentMethod: z.enum(["CASH", "MOBILE_MONEY", "BANK_TRANSFER", "CHEQUE", "CARD"]),
  collectedAt: z.date({ message: "Service date is required" }),
  notes: z.string().max(1000).optional(),
});

type CountFormValues = z.infer<typeof countSchema>;

const paymentMethods = Object.keys(CHURCH_PAYMENT_LABELS) as PaymentMethod[];

export default function ChurchCollectionDetailPage() {
  const params = useParams();
  const queryClient = useQueryClient();
  const { accessToken } = useAuth();
  const sessionId = Number(params.id);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const sessionQuery = useQuery({
    queryKey: ["church", "collections", sessionId],
    queryFn: async () => (await getCollectionSession(accessToken!, sessionId)).data,
    enabled: Boolean(accessToken) && !Number.isNaN(sessionId),
  });

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CountFormValues>({
    resolver: zodResolver(countSchema),
    defaultValues: {
      paymentMethod: "CASH",
      collectedAt: new Date(),
      notes: "",
    },
  });

  async function refresh() {
    await queryClient.invalidateQueries({ queryKey: ["church", "collections"] });
  }

  async function onCount(values: CountFormValues) {
    setActionError(null);
    try {
      const collectedAt = new Date(
        values.collectedAt.getFullYear(),
        values.collectedAt.getMonth(),
        values.collectedAt.getDate(),
        10,
        0,
        0,
      );
      await submitCollectionCount(accessToken!, sessionId, {
        totalAmount: values.totalAmount,
        paymentMethod: values.paymentMethod,
        collectedAt: collectedAt.toISOString(),
        notes: values.notes || undefined,
      });
      toast.success("Count saved — waiting for the treasurer to verify");
      await refresh();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Unable to save count");
    }
  }

  async function runAction(action: () => Promise<unknown>, success: string) {
    setActionError(null);
    setBusy(true);
    try {
      await action();
      toast.success(success);
      await refresh();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Action failed");
    } finally {
      setBusy(false);
    }
  }

  if (sessionQuery.isLoading) return <LoadingState />;
  if (sessionQuery.isError || !sessionQuery.data) {
    return <ErrorAlert message="Unable to load this collection." />;
  }

  const session = sessionQuery.data;

  return (
    <div className="space-y-4">
      <ChurchNav />
      <PageHeader
        breadcrumbs={[
          { label: "Church", href: "/church" },
          { label: "Sunday collections", href: "/church/collections" },
          { label: session.title || collectionTypeLabel(session.collectionType) },
        ]}
        title={session.title || collectionTypeLabel(session.collectionType)}
        description={`${collectionTypeLabel(session.collectionType)} · ${collectionStatusLabel(session.status)}`}
      />

      <WorkflowStepper
        steps={collectionSteps}
        current={session.status}
        labels={{
          DRAFT: "Draft",
          COUNTED: "Counted",
          VERIFIED: "Verified",
          DEPOSITED: "Banked",
        }}
      />

      {actionError && <ErrorAlert message={actionError} />}

      <DetailCard
        title="Collection"
        fields={[
          { label: "Status", value: <CollectionStatusBadge status={session.status} /> },
          { label: "Type", value: collectionTypeLabel(session.collectionType) },
          {
            label: "Amount",
            value: session.totalAmount != null ? formatCurrency(toNumber(session.totalAmount)) : "Not counted yet",
          },
          { label: "How it was received", value: churchPaymentLabel(session.paymentMethod) },
          { label: "Service date", value: formatDate(session.collectedAt ?? session.createdAt) },
          { label: "Where", value: session.location ?? "—" },
          { label: "Notes", value: session.notes ?? "—" },
          { label: "Started", value: formatDateTime(session.createdAt) },
          {
            label: "Gift on the books",
            value: session.donationId ? (
              <Link href={`/donations/${session.donationId}`} className="text-primary hover:underline">
                Open gift
              </Link>
            ) : (
              "Posts when the treasurer verifies"
            ),
          },
        ]}
      />

      {session.status === "DRAFT" && (
        <PermissionGate roles={["ORG_ADMIN", "FUNDRAISING_MANAGER", "STAFF"]}>
          <form
            onSubmit={handleSubmit(onCount)}
            className="space-y-4 rounded-lg border border-border bg-surface p-6"
          >
            <FormSection
              title="Enter the count"
              description="Cash from the plates, or the Lipa total for this service."
            >
              <FormField label="Counted amount (TZS)" error={errors.totalAmount?.message}>
                <Input type="number" min={0} step="0.01" {...register("totalAmount", { valueAsNumber: true })} />
              </FormField>
              <FormField label="How it was received" error={errors.paymentMethod?.message}>
                <select
                  className="h-9 w-full rounded-md border border-input bg-surface px-2.5 text-sm"
                  {...register("paymentMethod")}
                >
                  {paymentMethods.map((method) => (
                    <option key={method} value={method}>
                      {CHURCH_PAYMENT_LABELS[method]}
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField label="Service date" error={errors.collectedAt?.message}>
                <Controller
                  control={control}
                  name="collectedAt"
                  render={({ field }) => <DateInput value={field.value ?? null} onChange={field.onChange} />}
                />
              </FormField>
              <FormField label="Count notes" className="sm:col-span-2">
                <Input {...register("notes")} placeholder="Optional" />
              </FormField>
            </FormSection>
            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting}>
                Save count
              </Button>
            </div>
          </form>
        </PermissionGate>
      )}

      {session.status === "COUNTED" && (
        <PermissionGate roles={["ORG_ADMIN", "FINANCE_MANAGER"]}>
          <div className="rounded-lg border border-border bg-surface p-4">
            <p className="text-sm font-medium text-foreground">Verify this offering</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Confirm the count. FundFlow then posts it as a gift (offerings) on the books.
            </p>
            <Button
              className="mt-3"
              disabled={busy}
              onClick={() =>
                runAction(
                  () => verifyCollectionSession(accessToken!, sessionId),
                  "Verified — posted to the books",
                )
              }
            >
              Verify and post
            </Button>
          </div>
        </PermissionGate>
      )}

      {session.status === "VERIFIED" && (
        <PermissionGate roles={["ORG_ADMIN", "FINANCE_MANAGER"]}>
          <div className="rounded-lg border border-border bg-surface p-4">
            <p className="text-sm font-medium text-foreground">Cash banked?</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Mark this when the cash has been taken to the bank. Lipa collections can skip this if they already sit in mobile money.
            </p>
            <Button
              className="mt-3"
              variant="outline"
              disabled={busy}
              onClick={() =>
                runAction(
                  () => depositCollectionSession(accessToken!, sessionId),
                  "Marked as banked",
                )
              }
            >
              Mark as banked
            </Button>
          </div>
        </PermissionGate>
      )}
    </div>
  );
}
