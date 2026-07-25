"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { BeneficiaryForm } from "@/components/beneficiaries/beneficiary-form";
import { ErrorAlert } from "@/components/feedback/error-alert";
import { LoadingState } from "@/components/feedback/loading-state";
import { PageHeader } from "@/components/layout/page-header";
import { useAuth } from "@/hooks/use-auth";
import { getBeneficiary, updateBeneficiary } from "@/lib/api/beneficiaries";
import { parseApiDate } from "@/lib/utils/dates";
import { ApiError } from "@/types/api";
import type { BeneficiaryRequest } from "@/types/verticals";

export default function EditBeneficiaryPage() {
  const params = useParams();
  const router = useRouter();
  const { accessToken } = useAuth();
  const beneficiaryId = Number(params.id);
  const [serverError, setServerError] = useState<string | null>(null);

  const beneficiaryQuery = useQuery({
    queryKey: ["beneficiaries", beneficiaryId],
    queryFn: async () => (await getBeneficiary(accessToken!, beneficiaryId)).data,
    enabled: Boolean(accessToken) && !Number.isNaN(beneficiaryId),
  });

  async function handleSubmit(values: BeneficiaryRequest) {
    setServerError(null);
    try {
      await updateBeneficiary(accessToken!, beneficiaryId, values);
      toast.success("Beneficiary updated");
      router.push(`/beneficiaries/${beneficiaryId}`);
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : "Unable to update beneficiary");
    }
  }

  if (beneficiaryQuery.isLoading) return <LoadingState />;
  if (beneficiaryQuery.isError || !beneficiaryQuery.data) return <ErrorAlert message="Unable to load beneficiary." />;

  const beneficiary = beneficiaryQuery.data;
  const fullName = `${beneficiary.firstName} ${beneficiary.lastName}`;

  return (
    <div className="space-y-4">
      <PageHeader
        breadcrumbs={[
          { label: "Beneficiaries", href: "/beneficiaries" },
          { label: fullName, href: `/beneficiaries/${beneficiary.id}` },
          { label: "Edit" },
        ]}
        title="Edit beneficiary"
      />
      <BeneficiaryForm
        submitLabel="Save changes"
        serverError={serverError}
        defaultValues={{
          firstName: beneficiary.firstName,
          lastName: beneficiary.lastName,
          code: beneficiary.code,
          beneficiaryType: beneficiary.beneficiaryType,
          status: beneficiary.status,
          enrollmentDate: parseApiDate(beneficiary.enrollmentDate),
          notes: beneficiary.notes ?? "",
        }}
        onSubmit={handleSubmit}
        onCancel={() => router.push(`/beneficiaries/${beneficiaryId}`)}
      />
    </div>
  );
}
