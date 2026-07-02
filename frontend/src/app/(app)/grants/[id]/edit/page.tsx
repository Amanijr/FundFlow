"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { GrantForm } from "@/components/grants/grant-form";
import { ErrorAlert } from "@/components/feedback/error-alert";
import { LoadingState } from "@/components/feedback/loading-state";
import { PageHeader } from "@/components/layout/page-header";
import { useAuth } from "@/hooks/use-auth";
import { getGrant, updateGrant } from "@/lib/api/grants";
import { listFunds } from "@/lib/api/funds";
import { listPrograms } from "@/lib/api/programs";
import { parseApiDate } from "@/lib/utils/dates";
import { toNumber } from "@/lib/utils/format";
import { ApiError } from "@/types/api";
import type { GrantRequest } from "@/types/verticals";

export default function EditGrantPage() {
  const params = useParams();
  const router = useRouter();
  const { accessToken } = useAuth();
  const grantId = Number(params.id);
  const [serverError, setServerError] = useState<string | null>(null);

  const grantQuery = useQuery({
    queryKey: ["grants", grantId],
    queryFn: async () => (await getGrant(accessToken!, grantId)).data,
    enabled: Boolean(accessToken) && !Number.isNaN(grantId),
  });

  const programsQuery = useQuery({
    queryKey: ["programs"],
    queryFn: async () => (await listPrograms(accessToken!)).data,
    enabled: Boolean(accessToken),
  });

  const fundsQuery = useQuery({
    queryKey: ["funds"],
    queryFn: async () => (await listFunds(accessToken!)).data,
    enabled: Boolean(accessToken),
  });

  const programOptions = useMemo(
    () => (programsQuery.data ?? []).map((p) => ({ id: String(p.id), label: p.name, description: p.code })),
    [programsQuery.data],
  );

  const fundOptions = useMemo(
    () => (fundsQuery.data ?? []).map((f) => ({ id: String(f.id), label: f.name, description: f.code })),
    [fundsQuery.data],
  );

  async function handleSubmit(values: GrantRequest) {
    setServerError(null);
    try {
      await updateGrant(accessToken!, grantId, values);
      toast.success("Grant updated");
      router.push(`/grants/${grantId}`);
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : "Unable to update grant");
    }
  }

  if (grantQuery.isLoading || programsQuery.isLoading || fundsQuery.isLoading) return <LoadingState />;
  if (grantQuery.isError || !grantQuery.data) return <ErrorAlert message="Unable to load grant." />;

  const grant = grantQuery.data;

  return (
    <div className="space-y-4">
      <PageHeader
        breadcrumbs={[
          { label: "Grants", href: "/grants" },
          { label: grant.name, href: `/grants/${grant.id}` },
          { label: "Edit" },
        ]}
        title="Edit grant"
      />
      <GrantForm
        programOptions={programOptions}
        fundOptions={fundOptions}
        submitLabel="Save changes"
        serverError={serverError}
        defaultValues={{
          name: grant.name,
          grantCode: grant.grantCode,
          funderName: grant.funderName,
          awardedAmount: toNumber(grant.awardedAmount),
          startDate: parseApiDate(grant.startDate) ?? undefined,
          endDate: parseApiDate(grant.endDate) ?? undefined,
          restrictionType: grant.restrictionType,
          restrictionNotes: grant.restrictionNotes ?? "",
          programId: grant.programId ? String(grant.programId) : "",
          fundId: grant.fundId ? String(grant.fundId) : "",
        }}
        onSubmit={handleSubmit}
        onCancel={() => router.push(`/grants/${grantId}`)}
      />
    </div>
  );
}
