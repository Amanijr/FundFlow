"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { FundForm } from "@/components/funds/fund-form";
import { ErrorAlert } from "@/components/feedback/error-alert";
import { LoadingState } from "@/components/feedback/loading-state";
import { PageHeader } from "@/components/layout/page-header";
import { useAuth } from "@/hooks/use-auth";
import { getFund, updateFund } from "@/lib/api/funds";
import { toNumber } from "@/lib/utils/format";
import { ApiError } from "@/types/api";
import type { FundRequest } from "@/types/finance";

export default function EditFundPage() {
  const params = useParams();
  const router = useRouter();
  const { accessToken } = useAuth();
  const fundId = Number(params.id);
  const [serverError, setServerError] = useState<string | null>(null);

  const fundQuery = useQuery({
    queryKey: ["funds", fundId],
    queryFn: async () => (await getFund(accessToken!, fundId)).data,
    enabled: Boolean(accessToken) && !Number.isNaN(fundId),
  });

  async function handleSubmit(values: FundRequest) {
    setServerError(null);
    try {
      await updateFund(accessToken!, fundId, values);
      toast.success("Fund updated");
      router.push(`/funds/${fundId}`);
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : "Unable to update fund");
    }
  }

  if (fundQuery.isLoading) return <LoadingState />;
  if (fundQuery.isError || !fundQuery.data) return <ErrorAlert message="Unable to load fund." />;

  const fund = fundQuery.data;

  return (
    <div className="space-y-4">
      <PageHeader
        breadcrumbs={[
          { label: "Funds", href: "/funds" },
          { label: fund.name, href: `/funds/${fund.id}` },
          { label: "Edit" },
        ]}
        title="Edit fund"
      />
      <FundForm
        submitLabel="Save changes"
        serverError={serverError}
        defaultValues={{
          name: fund.name,
          code: fund.code,
          type: fund.type,
          description: fund.description ?? "",
          openingBalance: fund.openingBalance != null ? toNumber(fund.openingBalance) : 0,
          active: fund.active,
        }}
        onSubmit={handleSubmit}
        onCancel={() => router.push(`/funds/${fundId}`)}
      />
    </div>
  );
}
