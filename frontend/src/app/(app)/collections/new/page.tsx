"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { CollectionSessionForm } from "@/components/collections/collection-session-form";
import { LoadingState } from "@/components/feedback/loading-state";
import { PageHeader } from "@/components/layout/page-header";
import { useAuth } from "@/hooks/use-auth";
import { createCollectionSession } from "@/lib/api/collections";
import { listFunds } from "@/lib/api/funds";
import { ApiError } from "@/types/api";
import type { CollectionSessionCreateRequest } from "@/types/collection";

export default function NewCollectionPage() {
  const router = useRouter();
  const { accessToken } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);

  const fundsQuery = useQuery({
    queryKey: ["funds"],
    queryFn: async () => (await listFunds(accessToken!)).data,
    enabled: Boolean(accessToken),
  });

  async function handleSubmit(values: CollectionSessionCreateRequest) {
    setServerError(null);
    try {
      const response = await createCollectionSession(accessToken!, values);
      toast.success("Collection started — enter the counted amount next");
      router.push(`/collections/${response.data.id}`);
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : "Unable to start collection");
    }
  }

  if (fundsQuery.isLoading) return <LoadingState />;

  return (
    <div className="space-y-4">
      <PageHeader
        breadcrumbs={[
          { label: "Collections", href: "/collections" },
          { label: "New collection" },
        ]}
        title="New collection"
        description="Create the collection first, then enter the counted amount."
      />
      <CollectionSessionForm
        funds={fundsQuery.data ?? []}
        serverError={serverError}
        onSubmit={handleSubmit}
        onCancel={() => router.push("/collections")}
      />
    </div>
  );
}
