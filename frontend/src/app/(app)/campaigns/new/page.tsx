"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { CampaignForm } from "@/components/campaigns/campaign-form";
import { PageHeader } from "@/components/layout/page-header";
import { useAuth } from "@/hooks/use-auth";
import { createCampaign } from "@/lib/api/campaigns";
import { ApiError } from "@/types/api";
import type { CampaignRequest } from "@/types/fundraising";

export default function NewCampaignPage() {
  const router = useRouter();
  const { accessToken } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);

  async function handleSubmit(values: CampaignRequest) {
    setServerError(null);
    try {
      const response = await createCampaign(accessToken!, values);
      toast.success("Campaign created");
      router.push(`/campaigns/${response.data.id}`);
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : "Unable to create campaign");
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader
        breadcrumbs={[
          { label: "Campaigns", href: "/campaigns" },
          { label: "New campaign" },
        ]}
        title="Create campaign"
        description="Set a goal and timeline for your fundraising initiative."
      />
      <CampaignForm
        submitLabel="Create campaign"
        serverError={serverError}
        onSubmit={handleSubmit}
        onCancel={() => router.push("/campaigns")}
      />
    </div>
  );
}
