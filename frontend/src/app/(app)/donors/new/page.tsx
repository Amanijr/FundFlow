"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { DonorForm } from "@/components/donors/donor-form";
import { PageHeader } from "@/components/layout/page-header";
import { useAuth } from "@/hooks/use-auth";
import { createDonor } from "@/lib/api/donors";
import { ApiError } from "@/types/api";
import type { DonorRequest } from "@/types/fundraising";

export default function NewDonorPage() {
  const router = useRouter();
  const { accessToken } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);

  async function handleSubmit(values: DonorRequest) {
    setServerError(null);
    try {
      const response = await createDonor(accessToken!, values);
      toast.success("Donor created");
      router.push(`/donors/${response.data.id}`);
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : "Unable to create donor");
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader
        breadcrumbs={[
          { label: "Donors", href: "/donors" },
          { label: "New donor" },
        ]}
        title="Add donor"
        description="Create a new donor record for your organization."
      />
      <DonorForm
        submitLabel="Create donor"
        serverError={serverError}
        onSubmit={handleSubmit}
        onCancel={() => router.push("/donors")}
      />
    </div>
  );
}
