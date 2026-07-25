"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";

import { DetailCard } from "@/components/display/detail-card";
import { ErrorAlert } from "@/components/feedback/error-alert";
import { LoadingState } from "@/components/feedback/loading-state";
import { formatEnumLabel } from "@/components/finance/finance-status-badge";
import { PageHeader } from "@/components/layout/page-header";
import { PermissionGate } from "@/components/security/permission-gate";
import { BeneficiaryStatusBadge } from "@/components/verticals/vertical-status-badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { getBeneficiary } from "@/lib/api/beneficiaries";
import { formatDate, formatDateTime } from "@/lib/utils/dates";

export default function BeneficiaryDetailPage() {
  const params = useParams();
  const { accessToken } = useAuth();
  const beneficiaryId = Number(params.id);

  const beneficiaryQuery = useQuery({
    queryKey: ["beneficiaries", beneficiaryId],
    queryFn: async () => (await getBeneficiary(accessToken!, beneficiaryId)).data,
    enabled: Boolean(accessToken) && !Number.isNaN(beneficiaryId),
  });

  if (beneficiaryQuery.isLoading) return <LoadingState />;
  if (beneficiaryQuery.isError || !beneficiaryQuery.data) return <ErrorAlert message="Unable to load beneficiary." />;

  const beneficiary = beneficiaryQuery.data;
  const fullName = `${beneficiary.firstName} ${beneficiary.lastName}`;

  return (
    <div className="space-y-4">
      <PageHeader
        breadcrumbs={[{ label: "Beneficiaries", href: "/beneficiaries" }, { label: fullName }]}
        title={fullName}
        description={`Code ${beneficiary.code}`}
        action={
          <PermissionGate roles={["ORG_ADMIN", "PROGRAM_MANAGER", "STAFF"]}>
            <Button variant="outline" asChild>
              <Link href={`/beneficiaries/${beneficiary.id}/edit`}>Edit</Link>
            </Button>
          </PermissionGate>
        }
      />

      <div className="flex gap-2">
        <BeneficiaryStatusBadge status={beneficiary.status} />
        <span className="text-sm text-muted-foreground">{formatEnumLabel(beneficiary.beneficiaryType)}</span>
      </div>

      <DetailCard
        title="Profile"
        fields={[
          { label: "Enrollment date", value: beneficiary.enrollmentDate ? formatDate(beneficiary.enrollmentDate) : "—" },
          { label: "Notes", value: beneficiary.notes ?? "—" },
          { label: "Created", value: formatDateTime(beneficiary.createdAt) },
        ]}
      />

      {beneficiary.beneficiaryType === "STUDENT" && (
        <p className="text-sm text-muted-foreground">
          Manage sponsorships from{" "}
          <Link href="/school/sponsorships" className="text-primary hover:underline">
            School sponsorships
          </Link>
          .
        </p>
      )}
    </div>
  );
}
