"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { GrantForm } from "@/components/grants/grant-form";
import { PageHeader } from "@/components/layout/page-header";
import { LoadingState } from "@/components/feedback/loading-state";
import { useAuth } from "@/hooks/use-auth";
import { createGrant } from "@/lib/api/grants";
import { listFunds } from "@/lib/api/funds";
import { listPrograms } from "@/lib/api/programs";
import { ApiError } from "@/types/api";
import type { GrantRequest } from "@/types/verticals";

export default function NewGrantPage() {
  const router = useRouter();
  const { accessToken } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);

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
      const response = await createGrant(accessToken!, values);
      toast.success("Grant created");
      router.push(`/grants/${response.data.id}`);
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : "Unable to create grant");
    }
  }

  if (programsQuery.isLoading || fundsQuery.isLoading) return <LoadingState />;

  return (
    <div className="space-y-4">
      <PageHeader
        breadcrumbs={[{ label: "Grants", href: "/grants" }, { label: "New grant" }]}
        title="Create grant"
      />
      <GrantForm
        programOptions={programOptions}
        fundOptions={fundOptions}
        submitLabel="Create grant"
        serverError={serverError}
        onSubmit={handleSubmit}
        onCancel={() => router.push("/grants")}
      />
    </div>
  );
}
