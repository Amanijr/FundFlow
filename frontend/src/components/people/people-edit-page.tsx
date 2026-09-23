"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { ChurchNav } from "@/components/church/church-nav";
import { DonorForm } from "@/components/donors/donor-form";
import { ErrorAlert } from "@/components/feedback/error-alert";
import { LoadingState } from "@/components/feedback/loading-state";
import { PageHeader } from "@/components/layout/page-header";
import { useAuth } from "@/hooks/use-auth";
import { getPerson, updatePerson } from "@/lib/api/donors";
import { peopleCopy } from "@/lib/people/copy";
import { peopleListPath, personPath, type PeopleModule } from "@/lib/people/module";
import { ApiError } from "@/types/api";
import type { DonorRequest } from "@/types/fundraising";

export function PeopleEditPage({ module }: { module: PeopleModule }) {
  const params = useParams();
  const router = useRouter();
  const { accessToken } = useAuth();
  const copy = peopleCopy(module);
  const personId = Number(params.id);
  const [serverError, setServerError] = useState<string | null>(null);

  const personQuery = useQuery({
    queryKey: ["people", module, personId],
    queryFn: async () => {
      const response = await getPerson(accessToken!, module, personId);
      return response.data;
    },
    enabled: Boolean(accessToken) && !Number.isNaN(personId),
  });

  async function handleSubmit(values: DonorRequest) {
    setServerError(null);
    try {
      await updatePerson(accessToken!, module, personId, values);
      toast.success(copy.updatedToast);
      router.push(personPath(module, personId));
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : `Unable to update ${copy.noun}`);
    }
  }

  if (personQuery.isLoading) {
    return <LoadingState />;
  }

  if (personQuery.isError || !personQuery.data) {
    return <ErrorAlert message={`Unable to load ${copy.noun}.`} />;
  }

  const person = personQuery.data;

  return (
    <div className="space-y-4">
      {module === "members" ? <ChurchNav /> : null}
      <PageHeader
        breadcrumbs={[
          { label: copy.title, href: peopleListPath(module) },
          { label: `${person.firstName} ${person.lastName}`, href: personPath(module, person.id) },
          { label: "Edit" },
        ]}
        title={`Edit ${copy.noun}`}
      />
      <DonorForm
        submitLabel="Save changes"
        peopleNoun={copy.noun}
        serverError={serverError}
        defaultValues={{
          firstName: person.firstName,
          lastName: person.lastName,
          memberNumber: person.memberNumber ?? "",
          email: person.email ?? "",
          phone: person.phone ?? "",
          membershipStatus: person.membershipStatus ?? "ACTIVE",
          notes: person.notes ?? "",
          address: person.address ?? "",
          city: person.city ?? "",
          state: person.state ?? "",
          country: person.country ?? "",
        }}
        onSubmit={handleSubmit}
        onCancel={() => router.push(personPath(module, personId))}
      />
    </div>
  );
}
