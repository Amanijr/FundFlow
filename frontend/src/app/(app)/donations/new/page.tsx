"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { DonationForm } from "@/components/donations/donation-form";
import { ErrorAlert } from "@/components/feedback/error-alert";
import { LoadingState } from "@/components/feedback/loading-state";
import { PageHeader } from "@/components/layout/page-header";
import { useAuth } from "@/hooks/use-auth";
import { listCampaigns } from "@/lib/api/campaigns";
import { createDonation } from "@/lib/api/donations";
import { listDonors } from "@/lib/api/donors";
import { ApiError } from "@/types/api";
import type { DonationCreateRequest } from "@/types/fundraising";

export default function NewDonationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { accessToken } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);

  const prefillDonorId = searchParams.get("donorId") ?? "";
  const prefillCampaignId = searchParams.get("campaignId") ?? "";

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

  async function handleSubmit(values: DonationCreateRequest) {
    setServerError(null);
    try {
      const response = await createDonation(accessToken!, values);
      toast.success("Donation recorded");
      router.push(`/donations/${response.data.id}`);
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : "Unable to record donation");
    }
  }

  if (donorsQuery.isLoading || campaignsQuery.isLoading) {
    return <LoadingState />;
  }

  if (donorsQuery.isError || campaignsQuery.isError) {
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
        description="Create a new gift linked to a donor and optional campaign."
      />
      <DonationForm
        donorOptions={donorOptions}
        campaignOptions={campaignOptions}
        serverError={serverError}
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
