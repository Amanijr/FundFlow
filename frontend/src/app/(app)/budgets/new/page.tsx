"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { BudgetForm } from "@/components/budgets/budget-form";
import { PageHeader } from "@/components/layout/page-header";
import { useAuth } from "@/hooks/use-auth";
import { listCampaigns } from "@/lib/api/campaigns";
import { createBudget } from "@/lib/api/budgets";
import { listFunds } from "@/lib/api/funds";
import { ApiError } from "@/types/api";
import type { BudgetRequest } from "@/types/finance";

export default function NewBudgetPage() {
  const router = useRouter();
  const { accessToken } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);

  const fundsQuery = useQuery({
    queryKey: ["funds"],
    queryFn: async () => (await listFunds(accessToken!)).data,
    enabled: Boolean(accessToken),
  });

  const campaignsQuery = useQuery({
    queryKey: ["campaigns"],
    queryFn: async () => (await listCampaigns(accessToken!)).data,
    enabled: Boolean(accessToken),
  });

  const fundOptions = useMemo(
    () => (fundsQuery.data ?? []).map((f) => ({ id: String(f.id), label: f.name, description: f.code })),
    [fundsQuery.data],
  );

  const campaignOptions = useMemo(
    () => (campaignsQuery.data ?? []).map((c) => ({ id: String(c.id), label: c.name })),
    [campaignsQuery.data],
  );

  async function handleSubmit(values: BudgetRequest) {
    setServerError(null);
    try {
      const response = await createBudget(accessToken!, values);
      toast.success("Budget created");
      router.push(`/budgets/${response.data.id}`);
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : "Unable to create budget");
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader
        breadcrumbs={[{ label: "Budgets", href: "/budgets" }, { label: "New budget" }]}
        title="Create budget"
      />
      <BudgetForm
        fundOptions={fundOptions}
        campaignOptions={campaignOptions}
        submitLabel="Create budget"
        serverError={serverError}
        onSubmit={handleSubmit}
        onCancel={() => router.push("/budgets")}
      />
    </div>
  );
}
