"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { ChurchNav } from "@/components/church/church-nav";
import { ServiceForm } from "@/components/church/service-form";
import { PageHeader } from "@/components/layout/page-header";
import { LoadingState } from "@/components/feedback/loading-state";
import { useAuth } from "@/hooks/use-auth";
import { createService, listMinistries } from "@/lib/api/church";
import { ApiError } from "@/types/api";
import type { ServiceEventRequest } from "@/types/verticals";

export default function NewServicePage() {
  const router = useRouter();
  const { accessToken } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);

  const ministriesQuery = useQuery({
    queryKey: ["church", "ministries"],
    queryFn: async () => (await listMinistries(accessToken!)).data,
    enabled: Boolean(accessToken),
  });

  const ministryOptions = useMemo(
    () => (ministriesQuery.data ?? []).map((m) => ({ id: String(m.id), label: m.name, description: m.code })),
    [ministriesQuery.data],
  );

  async function handleSubmit(values: ServiceEventRequest) {
    setServerError(null);
    try {
      const response = await createService(accessToken!, values);
      toast.success("Service saved");
      router.push(`/church/services/${response.data.id}`);
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : "Unable to create service");
    }
  }

  if (ministriesQuery.isLoading) return <LoadingState />;

  return (
    <div className="space-y-4">
      <ChurchNav />
      <PageHeader
        breadcrumbs={[
          { label: "Church", href: "/church" },
          { label: "Services", href: "/church/services" },
          { label: "New service" },
        ]}
        title="Add service"
      />
      <ServiceForm
        ministryOptions={ministryOptions}
        submitLabel="Add service"
        serverError={serverError}
        onSubmit={handleSubmit}
        onCancel={() => router.push("/church/services")}
      />
    </div>
  );
}
