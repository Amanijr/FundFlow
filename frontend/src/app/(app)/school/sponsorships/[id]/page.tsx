"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { SponsorshipForm } from "@/components/school/sponsorship-form";
import { DetailCard } from "@/components/display/detail-card";
import { ErrorAlert } from "@/components/feedback/error-alert";
import { LoadingState } from "@/components/feedback/loading-state";
import { PageHeader } from "@/components/layout/page-header";
import { PermissionGate } from "@/components/security/permission-gate";
import { SponsorshipStatusBadge } from "@/components/verticals/vertical-status-badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { listBeneficiaries } from "@/lib/api/beneficiaries";
import { listDonors } from "@/lib/api/donors";
import { getSponsorship, updateSponsorship } from "@/lib/api/school";
import { parseApiDate } from "@/lib/utils/dates";
import { formatCurrency, toNumber } from "@/lib/utils/format";
import { formatDate, formatDateTime } from "@/lib/utils/dates";
import { ApiError } from "@/types/api";
import type { StudentSponsorshipRequest } from "@/types/verticals";

export default function SponsorshipDetailPage() {
  const params = useParams();
  const { accessToken } = useAuth();
  const sponsorshipId = Number(params.id);
  const [editing, setEditing] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const sponsorshipQuery = useQuery({
    queryKey: ["school", "sponsorships", sponsorshipId],
    queryFn: async () => (await getSponsorship(accessToken!, sponsorshipId)).data,
    enabled: Boolean(accessToken) && !Number.isNaN(sponsorshipId),
  });

  const beneficiariesQuery = useQuery({
    queryKey: ["beneficiaries"],
    queryFn: async () => (await listBeneficiaries(accessToken!)).data,
    enabled: Boolean(accessToken) && editing,
  });

  const donorsQuery = useQuery({
    queryKey: ["donors"],
    queryFn: async () => (await listDonors(accessToken!)).data,
    enabled: Boolean(accessToken) && editing,
  });

  const beneficiaryOptions =
    (beneficiariesQuery.data ?? [])
      .filter((b) => b.beneficiaryType === "STUDENT")
      .map((b) => ({
        id: String(b.id),
        label: `${b.firstName} ${b.lastName}`,
        description: b.code,
      })) ?? [];

  const donorOptions =
    (donorsQuery.data ?? []).map((d) => ({
      id: String(d.id),
      label: `${d.firstName} ${d.lastName}`.trim(),
      description: d.email ?? undefined,
    })) ?? [];

  async function handleSubmit(values: StudentSponsorshipRequest) {
    setServerError(null);
    try {
      await updateSponsorship(accessToken!, sponsorshipId, values);
      toast.success("Sponsorship updated");
      setEditing(false);
      await sponsorshipQuery.refetch();
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : "Unable to update sponsorship");
    }
  }

  if (sponsorshipQuery.isLoading) return <LoadingState />;
  if (sponsorshipQuery.isError || !sponsorshipQuery.data) return <ErrorAlert message="Unable to load sponsorship." />;

  const sponsorship = sponsorshipQuery.data;

  if (editing) {
    if (beneficiariesQuery.isLoading || donorsQuery.isLoading) return <LoadingState />;

    return (
      <div className="space-y-4">
        <PageHeader
          breadcrumbs={[
            { label: "School", href: "/school/sponsorships" },
            { label: "Sponsorships", href: "/school/sponsorships" },
            { label: sponsorship.beneficiaryName },
          ]}
          title="Edit sponsorship"
        />
        <SponsorshipForm
          beneficiaryOptions={beneficiaryOptions}
          donorOptions={donorOptions}
          submitLabel="Save changes"
          serverError={serverError}
          defaultValues={{
            beneficiaryId: String(sponsorship.beneficiaryId),
            donorId: String(sponsorship.donorId),
            academicYear: sponsorship.academicYear,
            term: sponsorship.term ?? "",
            amount: toNumber(sponsorship.amount),
            status: sponsorship.status,
            startDate: parseApiDate(sponsorship.startDate),
            endDate: parseApiDate(sponsorship.endDate),
            notes: sponsorship.notes ?? "",
          }}
          onSubmit={handleSubmit}
          onCancel={() => setEditing(false)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PageHeader
        breadcrumbs={[
          { label: "School", href: "/school/sponsorships" },
          { label: "Sponsorships", href: "/school/sponsorships" },
          { label: sponsorship.beneficiaryName },
        ]}
        title={sponsorship.beneficiaryName}
        description={`${sponsorship.academicYear}${sponsorship.term ? ` · ${sponsorship.term}` : ""}`}
        action={
          <PermissionGate roles={["ORG_ADMIN", "PROGRAM_MANAGER", "STAFF"]}>
            <Button variant="outline" onClick={() => setEditing(true)}>
              Edit
            </Button>
          </PermissionGate>
        }
      />

      <SponsorshipStatusBadge status={sponsorship.status} />

      <DetailCard
        title="Sponsorship details"
        fields={[
          {
            label: "Beneficiary",
            value: (
              <Link href={`/beneficiaries/${sponsorship.beneficiaryId}`} className="text-primary hover:underline">
                {sponsorship.beneficiaryName}
              </Link>
            ),
          },
          {
            label: "Donor",
            value: (
              <Link href={`/donors/${sponsorship.donorId}`} className="text-primary hover:underline">
                {sponsorship.donorName}
              </Link>
            ),
          },
          { label: "Amount", value: formatCurrency(toNumber(sponsorship.amount)) },
          { label: "Start date", value: sponsorship.startDate ? formatDate(sponsorship.startDate) : "—" },
          { label: "End date", value: sponsorship.endDate ? formatDate(sponsorship.endDate) : "—" },
          { label: "Notes", value: sponsorship.notes ?? "—" },
          { label: "Created", value: formatDateTime(sponsorship.createdAt) },
        ]}
      />
    </div>
  );
}
