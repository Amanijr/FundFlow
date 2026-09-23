"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { ChurchNav } from "@/components/church/church-nav";
import { PartnershipForm } from "@/components/church/partnership-form";
import { ErrorAlert } from "@/components/feedback/error-alert";
import { LoadingState } from "@/components/feedback/loading-state";
import { PageHeader } from "@/components/layout/page-header";
import { useAuth } from "@/hooks/use-auth";
import { createPartnership } from "@/lib/api/church";
import { listPeople } from "@/lib/api/donors";
import { listFunds } from "@/lib/api/funds";
import { ApiError } from "@/types/api";
import type { PartnershipRequest } from "@/types/verticals";

export default function NewPartnershipPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { accessToken } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);
  const prefillMemberId = searchParams.get("memberId") ?? "";

  const membersQuery = useQuery({
    queryKey: ["people", "members"],
    queryFn: async () => (await listPeople(accessToken!, "members")).data,
    enabled: Boolean(accessToken),
  });

  const fundsQuery = useQuery({
    queryKey: ["funds"],
    queryFn: async () => (await listFunds(accessToken!)).data,
    enabled: Boolean(accessToken),
  });

  const memberOptions = useMemo(
    () =>
      (membersQuery.data ?? []).map((member) => ({
        id: String(member.id),
        label: `${member.firstName} ${member.lastName}${member.memberNumber ? ` (${member.memberNumber})` : ""}`,
      })),
    [membersQuery.data],
  );

  const fundOptions = useMemo(
    () => (fundsQuery.data ?? []).map((fund) => ({ id: String(fund.id), label: fund.name })),
    [fundsQuery.data],
  );

  async function handleSubmit(values: PartnershipRequest) {
    setServerError(null);
    try {
      const response = await createPartnership(accessToken!, values);
      toast.success("Partnership added");
      router.push(`/church/partnerships/${response.data.id}`);
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : "Unable to add partnership");
    }
  }

  if (membersQuery.isLoading || fundsQuery.isLoading) return <LoadingState />;
  if (membersQuery.isError) return <ErrorAlert message="Unable to load members." />;

  return (
    <div className="space-y-4">
      <ChurchNav />
      <PageHeader
        breadcrumbs={[
          { label: "Church", href: "/church" },
          { label: "Partnerships", href: "/church/partnerships" },
          { label: "New partnership" },
        ]}
        title="Add partnership"
      />
      <PartnershipForm
        memberOptions={memberOptions}
        fundOptions={fundOptions}
        lockMember={Boolean(prefillMemberId)}
        defaultValues={{ memberId: prefillMemberId }}
        submitLabel="Add partnership"
        serverError={serverError}
        onSubmit={handleSubmit}
        onCancel={() => router.push("/church/partnerships")}
      />
    </div>
  );
}
