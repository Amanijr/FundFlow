"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { FundForm } from "@/components/funds/fund-form";
import { PageHeader } from "@/components/layout/page-header";
import { useAuth } from "@/hooks/use-auth";
import { createFund } from "@/lib/api/funds";
import { ApiError } from "@/types/api";
import type { FundRequest } from "@/types/finance";

export default function NewFundPage() {
  const router = useRouter();
  const { accessToken } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);

  async function handleSubmit(values: FundRequest) {
    setServerError(null);
    try {
      const response = await createFund(accessToken!, values);
      toast.success("Fund created");
      router.push(`/funds/${response.data.id}`);
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : "Unable to create fund");
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader
        breadcrumbs={[{ label: "Funds", href: "/funds" }, { label: "New fund" }]}
        title="Create fund"
      />
      <FundForm submitLabel="Create fund" serverError={serverError} onSubmit={handleSubmit} onCancel={() => router.push("/funds")} />
    </div>
  );
}
