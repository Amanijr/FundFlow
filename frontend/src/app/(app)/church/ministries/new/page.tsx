"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { MinistryForm } from "@/components/church/ministry-form";
import { PageHeader } from "@/components/layout/page-header";
import { useAuth } from "@/hooks/use-auth";
import { createMinistry } from "@/lib/api/church";
import { ApiError } from "@/types/api";
import type { MinistryRequest } from "@/types/verticals";

export default function NewMinistryPage() {
  const router = useRouter();
  const { accessToken } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);

  async function handleSubmit(values: MinistryRequest) {
    setServerError(null);
    try {
      const response = await createMinistry(accessToken!, values);
      toast.success("Ministry created");
      router.push(`/church/ministries/${response.data.id}`);
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : "Unable to create ministry");
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader
        breadcrumbs={[
          { label: "Church", href: "/church/ministries" },
          { label: "Ministries", href: "/church/ministries" },
          { label: "New ministry" },
        ]}
        title="Add ministry"
      />
      <MinistryForm
        submitLabel="Add ministry"
        serverError={serverError}
        onSubmit={handleSubmit}
        onCancel={() => router.push("/church/ministries")}
      />
    </div>
  );
}
