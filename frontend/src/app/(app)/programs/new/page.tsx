"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { ProgramForm } from "@/components/programs/program-form";
import { PageHeader } from "@/components/layout/page-header";
import { LoadingState } from "@/components/feedback/loading-state";
import { useAuth } from "@/hooks/use-auth";
import { createProgram } from "@/lib/api/programs";
import { listFunds } from "@/lib/api/funds";
import { ApiError } from "@/types/api";
import type { ProgramRequest } from "@/types/verticals";

export default function NewProgramPage() {
  const router = useRouter();
  const { accessToken } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);

  const fundsQuery = useQuery({
    queryKey: ["funds"],
    queryFn: async () => (await listFunds(accessToken!)).data,
    enabled: Boolean(accessToken),
  });

  const fundOptions = useMemo(
    () => (fundsQuery.data ?? []).map((f) => ({ id: String(f.id), label: f.name, description: f.code })),
    [fundsQuery.data],
  );

  async function handleSubmit(values: ProgramRequest) {
    setServerError(null);
    try {
      const response = await createProgram(accessToken!, values);
      toast.success("Program created");
      router.push(`/programs/${response.data.id}`);
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : "Unable to create program");
    }
  }

  if (fundsQuery.isLoading) return <LoadingState />;

  return (
    <div className="space-y-4">
      <PageHeader
        breadcrumbs={[{ label: "Programs", href: "/programs" }, { label: "New program" }]}
        title="Create program"
      />
      <ProgramForm
        fundOptions={fundOptions}
        submitLabel="Create program"
        serverError={serverError}
        onSubmit={handleSubmit}
        onCancel={() => router.push("/programs")}
      />
    </div>
  );
}
