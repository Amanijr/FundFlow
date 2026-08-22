"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { DonationForm, type DonationIntakePayload } from "@/components/donations/donation-form";
import { ErrorAlert } from "@/components/feedback/error-alert";
import { LoadingState } from "@/components/feedback/loading-state";
import { PageHeader } from "@/components/layout/page-header";
import { useAuth } from "@/hooks/use-auth";
import { listCampaigns } from "@/lib/api/campaigns";
import { createDonation } from "@/lib/api/donations";
import { listDonors } from "@/lib/api/donors";
import { listFunds } from "@/lib/api/funds";
import { processGatewayPayment, recordManualPayment } from "@/lib/api/payments";
import { useSessionPreferencesStore } from "@/stores/session-preferences-store";
import { ApiError } from "@/types/api";

export default function NewDonationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { accessToken, user } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);
  const lastCampaignId = useSessionPreferencesStore((state) => state.lastCampaignId);
  const setLastCampaignId = useSessionPreferencesStore((state) => state.setLastCampaignId);

  const prefillDonorId = searchParams.get("donorId") ?? "";
  const prefillCampaignId = searchParams.get("campaignId") ?? lastCampaignId ?? "";
  const canRecordManual = user?.role === "ORG_ADMIN" || user?.role === "FINANCE_MANAGER";

  const donorsQuery = useQuery({
    queryKey: ["donors"],
    queryFn: async () => {
      const response = await listDonors(accessToken!);
      return response.data;
    },
    enabled: Boolean(accessToken),
  });

  const campaignsQuery = useQuery({
    queryKey: ["campaigns"],
    queryFn: async () => {
      const response = await listCampaigns(accessToken!);
      return response.data;
    },
    enabled: Boolean(accessToken),
  });

  const fundsQuery = useQuery({
    queryKey: ["funds"],
    queryFn: async () => (await listFunds(accessToken!)).data,
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

  const fundOptions = useMemo(
    () =>
      (fundsQuery.data ?? []).map((fund) => ({
        id: String(fund.id),
        label: fund.name,
        description: fund.description,
      })),
    [fundsQuery.data],
  );

  async function handleSubmit(payload: DonationIntakePayload) {
    setServerError(null);
    try {
      const response = await createDonation(accessToken!, payload.donation);
      if (payload.donation.campaignId) {
        setLastCampaignId(String(payload.donation.campaignId));
      }

      const payment = payload.payment;
      if (payment && !payment.skip && payload.donation.donationType !== "IN_KIND") {
        if (payment.channel === "MANUAL") {
          if (!canRecordManual) {
            throw new Error("Only the treasurer or org admin can record cash, Lipa, or bank");
          }
          await recordManualPayment(accessToken!, response.data.id, {
            paymentMethod: payment.paymentMethod,
            receiptNumber: payment.receiptNumber || `RCP-${Date.now()}`,
            collectionDate: new Date().toISOString(),
            paymentNotes: payment.paymentNotes,
          });
          toast.success("Donation saved and payment recorded");
        } else {
          await processGatewayPayment(accessToken!, response.data.id, {
            paymentMethod: payment.paymentMethod,
          });
          toast.success("Donation saved and payment recorded");
        }
      } else if (payload.donation.donationType === "IN_KIND") {
        toast.success("In-kind donation recorded");
      } else {
        toast.success("Donation saved as pending — record payment when money arrives");
      }

      router.push(`/donations/${response.data.id}`);
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : "Unable to record donation");
    }
  }

  if (donorsQuery.isLoading || campaignsQuery.isLoading || fundsQuery.isLoading) {
    return <LoadingState />;
  }

  if (donorsQuery.isError || campaignsQuery.isError || fundsQuery.isError) {
    return <ErrorAlert message="Unable to load form options." />;
  }

  return (
    <div className="space-y-4">
      <PageHeader
        breadcrumbs={[
          { label: "Donations", href: "/donations" },
          { label: "Record donation" },
        ]}
        title="Record donation"
        description="One sequence: gift details, optional extras, then cash / Lipa / pay later."
      />
      <DonationForm
        donorOptions={donorOptions}
        campaignOptions={campaignOptions}
        fundOptions={fundOptions}
        serverError={serverError}
        canRecordManual={canRecordManual}
        defaultValues={{
          donorId: prefillDonorId,
          campaignId: prefillCampaignId,
        }}
        onSubmit={handleSubmit}
        onCancel={() => router.push("/donations")}
      />
    </div>
  );
}
