"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { ProgramForm } from "@/components/programs/program-form";
import { ErrorAlert } from "@/components/feedback/error-alert";
import { LoadingState } from "@/components/feedback/loading-state";
import { PageHeader } from "@/components/layout/page-header";
import { useAuth } from "@/hooks/use-auth";
import { getProgram, updateProgram } from "@/lib/api/programs";
import { listFunds } from "@/lib/api/funds";
import { parseApiDate } from "@/lib/utils/dates";
import { ApiError } from "@/types/api";
import type { ProgramRequest } from "@/types/verticals";

export default function EditProgramPage() {
  const params = useParams();
  const router = useRouter();
  const { accessToken } = useAuth();
  const programId = Number(params.id);
  const [serverError, setServerError] = useState<string | null>(null);

  const programQuery = useQuery({
    queryKey: ["programs", programId],
    queryFn: async () => (await getProgram(accessToken!, programId)).data,
    enabled: Boolean(accessToken) && !Number.isNaN(programId),
  });

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
      await updateProgram(accessToken!, programId, values);
      toast.success("Program updated");
      router.push(`/programs/${programId}`);
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : "Unable to update program");
    }
  }

  if (programQuery.isLoading || fundsQuery.isLoading) return <LoadingState />;
  if (programQuery.isError || !programQuery.data) return <ErrorAlert message="Unable to load program." />;

  const program = programQuery.data;

  return (
    <div className="space-y-4">
      <PageHeader
        breadcrumbs={[
          { label: "Programs", href: "/programs" },
          { label: program.name, href: `/programs/${program.id}` },
          { label: "Edit" },
        ]}
        title="Edit program"
      />
      <ProgramForm
        fundOptions={fundOptions}
        submitLabel="Save changes"
        serverError={serverError}
        defaultValues={{
          name: program.name,
          code: program.code,
          description: program.description ?? "",
          status: program.status,
          startDate: parseApiDate(program.startDate),
          endDate: parseApiDate(program.endDate),
          fundId: program.fundId ? String(program.fundId) : "",
        }}
        onSubmit={handleSubmit}
        onCancel={() => router.push(`/programs/${programId}`)}
      />
    </div>
  );
}
