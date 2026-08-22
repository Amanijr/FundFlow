"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { ChurchNav } from "@/components/church/church-nav";
import { CollectionSessionForm } from "@/components/church/collection-session-form";
import { PageHeader } from "@/components/layout/page-header";
import { useAuth } from "@/hooks/use-auth";
import { createCollectionSession } from "@/lib/api/collections";
import { ApiError } from "@/types/api";
import type { CollectionSessionCreateRequest } from "@/types/collection";

export default function NewChurchCollectionPage() {
  const router = useRouter();
  const { accessToken } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);

  async function handleSubmit(values: CollectionSessionCreateRequest) {
    setServerError(null);
    try {
      const response = await createCollectionSession(accessToken!, values);
      toast.success("Collection started — enter the counted amount next");
      router.push(`/church/collections/${response.data.id}`);
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : "Unable to start collection");
    }
  }

  return (
    <div className="space-y-4">
      <ChurchNav />
      <PageHeader
        breadcrumbs={[
          { label: "Church", href: "/church" },
          { label: "Sunday collections", href: "/church/collections" },
          { label: "New collection" },
        ]}
        title="New Sunday collection"
        description="Create the session first. You will enter the counted cash or Lipa total on the next screen."
      />
      <CollectionSessionForm
        serverError={serverError}
        onSubmit={handleSubmit}
        onCancel={() => router.push("/church/collections")}
      />
    </div>
  );
}
