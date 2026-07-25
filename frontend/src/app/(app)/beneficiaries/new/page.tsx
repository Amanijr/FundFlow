"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { BeneficiaryForm } from "@/components/beneficiaries/beneficiary-form";
import { PageHeader } from "@/components/layout/page-header";
import { useAuth } from "@/hooks/use-auth";
import { createBeneficiary } from "@/lib/api/beneficiaries";
import { ApiError } from "@/types/api";
import type { BeneficiaryRequest } from "@/types/verticals";

export default function NewBeneficiaryPage() {
  const router = useRouter();
  const { accessToken } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);

  async function handleSubmit(values: BeneficiaryRequest) {
    setServerError(null);
    try {
      const response = await createBeneficiary(accessToken!, values);
      toast.success("Beneficiary added");
      router.push(`/beneficiaries/${response.data.id}`);
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : "Unable to add beneficiary");
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader
        breadcrumbs={[{ label: "Beneficiaries", href: "/beneficiaries" }, { label: "New beneficiary" }]}
        title="Add beneficiary"
      />
      <BeneficiaryForm
        submitLabel="Add beneficiary"
        serverError={serverError}
        onSubmit={handleSubmit}
        onCancel={() => router.push("/beneficiaries")}
      />
    </div>
  );
}
