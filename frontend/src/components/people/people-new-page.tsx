"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { ChurchNav } from "@/components/church/church-nav";
import { DonorForm } from "@/components/donors/donor-form";
import { PageHeader } from "@/components/layout/page-header";
import { useAuth } from "@/hooks/use-auth";
import { createPerson } from "@/lib/api/donors";
import { peopleCopy } from "@/lib/people/copy";
import { peopleListPath, personPath, type PeopleModule } from "@/lib/people/module";
import { ApiError } from "@/types/api";
import type { DonorRequest } from "@/types/fundraising";

export function PeopleNewPage({ module }: { module: PeopleModule }) {
  const router = useRouter();
  const { accessToken } = useAuth();
  const copy = peopleCopy(module);
  const [serverError, setServerError] = useState<string | null>(null);

  async function handleSubmit(values: DonorRequest) {
    setServerError(null);
    try {
      const response = await createPerson(accessToken!, module, values);
      toast.success(copy.createdToast);
      router.push(personPath(module, response.data.id));
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : `Unable to create ${copy.noun}`);
    }
  }

  return (
    <div className="space-y-4">
      {module === "members" ? <ChurchNav /> : null}
      <PageHeader
        breadcrumbs={[
          { label: copy.title, href: peopleListPath(module) },
          { label: copy.addLabel },
        ]}
        title={copy.addLabel}
        description={copy.formDescription}
      />
      <DonorForm
        submitLabel={copy.addLabel}
        peopleNoun={copy.noun}
        serverError={serverError}
        onSubmit={handleSubmit}
        onCancel={() => router.push(peopleListPath(module))}
      />
    </div>
  );
}
