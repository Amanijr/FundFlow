"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { DonorForm } from "@/components/donors/donor-form";
import { ErrorAlert } from "@/components/feedback/error-alert";
import { LoadingState } from "@/components/feedback/loading-state";
import { PageHeader } from "@/components/layout/page-header";
import { useAuth } from "@/hooks/use-auth";
import { getDonor, updateDonor } from "@/lib/api/donors";
import { ApiError } from "@/types/api";
import type { DonorRequest } from "@/types/fundraising";

export default function EditDonorPage() {
  const params = useParams();
  const router = useRouter();
  const { accessToken } = useAuth();
  const donorId = Number(params.id);
  const [serverError, setServerError] = useState<string | null>(null);

  const donorQuery = useQuery({
    queryKey: ["donors", donorId],
    queryFn: async () => {
      const response = await getDonor(accessToken!, donorId);
      return response.data;
    },
    enabled: Boolean(accessToken) && !Number.isNaN(donorId),
  });

  async function handleSubmit(values: DonorRequest) {
    setServerError(null);
    try {
      await updateDonor(accessToken!, donorId, values);
      toast.success("Donor updated");
      router.push(`/donors/${donorId}`);
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : "Unable to update donor");
    }
  }

  if (donorQuery.isLoading) {
    return <LoadingState />;
  }

  if (donorQuery.isError || !donorQuery.data) {
    return <ErrorAlert message="Unable to load donor." />;
  }

  const donor = donorQuery.data;

  return (
    <div className="space-y-4">
      <PageHeader
        breadcrumbs={[
          { label: "Donors", href: "/donors" },
          { label: `${donor.firstName} ${donor.lastName}`, href: `/donors/${donor.id}` },
          { label: "Edit" },
        ]}
        title="Edit donor"
      />
      <DonorForm
        submitLabel="Save changes"
        serverError={serverError}
        defaultValues={{
          firstName: donor.firstName,
          lastName: donor.lastName,
          email: donor.email,
          phone: donor.phone,
          address: donor.address ?? "",
          city: donor.city ?? "",
          state: donor.state ?? "",
          country: donor.country ?? "",
        }}
        onSubmit={handleSubmit}
        onCancel={() => router.push(`/donors/${donorId}`)}
      />
    </div>
  );
}
