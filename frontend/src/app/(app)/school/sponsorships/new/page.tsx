"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { SponsorshipForm } from "@/components/school/sponsorship-form";
import { PageHeader } from "@/components/layout/page-header";
import { LoadingState } from "@/components/feedback/loading-state";
import { useAuth } from "@/hooks/use-auth";
import { listBeneficiaries } from "@/lib/api/beneficiaries";
import { listDonors } from "@/lib/api/donors";
import { createSponsorship } from "@/lib/api/school";
import { ApiError } from "@/types/api";
import type { StudentSponsorshipRequest } from "@/types/verticals";

export default function NewSponsorshipPage() {
  const router = useRouter();
  const { accessToken } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);

  const beneficiariesQuery = useQuery({
    queryKey: ["beneficiaries"],
    queryFn: async () => (await listBeneficiaries(accessToken!)).data,
    enabled: Boolean(accessToken),
  });

  const donorsQuery = useQuery({
    queryKey: ["donors"],
    queryFn: async () => (await listDonors(accessToken!)).data,
    enabled: Boolean(accessToken),
  });

  const beneficiaryOptions = useMemo(
    () =>
      (beneficiariesQuery.data ?? [])
        .filter((b) => b.beneficiaryType === "STUDENT")
        .map((b) => ({
          id: String(b.id),
          label: `${b.firstName} ${b.lastName}`,
          description: b.code,
        })),
    [beneficiariesQuery.data],
  );

  const donorOptions = useMemo(
    () =>
      (donorsQuery.data ?? []).map((d) => ({
        id: String(d.id),
        label: `${d.firstName} ${d.lastName}`.trim(),
        description: d.email ?? undefined,
      })),
    [donorsQuery.data],
  );

  async function handleSubmit(values: StudentSponsorshipRequest) {
    setServerError(null);
    try {
      const response = await createSponsorship(accessToken!, values);
      toast.success("Sponsorship created");
      router.push(`/school/sponsorships/${response.data.id}`);
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : "Unable to create sponsorship");
    }
  }

  if (beneficiariesQuery.isLoading || donorsQuery.isLoading) return <LoadingState />;

  return (
    <div className="space-y-4">
      <PageHeader
        breadcrumbs={[
          { label: "School", href: "/school/sponsorships" },
          { label: "Sponsorships", href: "/school/sponsorships" },
          { label: "New sponsorship" },
        ]}
        title="Create sponsorship"
      />
      <SponsorshipForm
        beneficiaryOptions={beneficiaryOptions}
        donorOptions={donorOptions}
        submitLabel="Create sponsorship"
        serverError={serverError}
        onSubmit={handleSubmit}
        onCancel={() => router.push("/school/sponsorships")}
      />
    </div>
  );
}
