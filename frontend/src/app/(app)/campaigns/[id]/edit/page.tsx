"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { CampaignForm } from "@/components/campaigns/campaign-form";
import { ErrorAlert } from "@/components/feedback/error-alert";
import { LoadingState } from "@/components/feedback/loading-state";
import { PageHeader } from "@/components/layout/page-header";
import { useAuth } from "@/hooks/use-auth";
import { getCampaign, updateCampaign } from "@/lib/api/campaigns";
import { parseApiDate } from "@/lib/utils/dates";
import { toNumber } from "@/lib/utils/format";
import { ApiError } from "@/types/api";
import type { CampaignRequest } from "@/types/fundraising";

export default function EditCampaignPage() {
  const params = useParams();
  const router = useRouter();
  const { accessToken } = useAuth();
  const campaignId = Number(params.id);
  const [serverError, setServerError] = useState<string | null>(null);

  const campaignQuery = useQuery({
    queryKey: ["campaigns", campaignId],
    queryFn: async () => {
      const response = await getCampaign(accessToken!, campaignId);
      return response.data;
    },
    enabled: Boolean(accessToken) && !Number.isNaN(campaignId),
  });

  async function handleSubmit(values: CampaignRequest) {
    setServerError(null);
    try {
      await updateCampaign(accessToken!, campaignId, values);
      toast.success("Campaign updated");
      router.push(`/campaigns/${campaignId}`);
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : "Unable to update campaign");
    }
  }

  if (campaignQuery.isLoading) {
    return <LoadingState />;
  }

  if (campaignQuery.isError || !campaignQuery.data) {
    return <ErrorAlert message="Unable to load campaign." />;
  }

  const campaign = campaignQuery.data;

  return (
    <div className="space-y-4">
      <PageHeader
        breadcrumbs={[
          { label: "Campaigns", href: "/campaigns" },
          { label: campaign.name, href: `/campaigns/${campaign.id}` },
          { label: "Edit" },
        ]}
        title="Edit campaign"
      />
      <CampaignForm
        submitLabel="Save changes"
        serverError={serverError}
        defaultValues={{
          name: campaign.name,
          description: campaign.description ?? "",
          targetAmount: campaign.targetAmount != null ? toNumber(campaign.targetAmount) : 0,
          startDate: parseApiDate(campaign.startDate),
          endDate: parseApiDate(campaign.endDate),
          status: campaign.status,
        }}
        onSubmit={handleSubmit}
        onCancel={() => router.push(`/campaigns/${campaignId}`)}
      />
    </div>
  );
}
