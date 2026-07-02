"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

import { MfaChallengeForm } from "@/components/auth/mfa-challenge-form";
import { LoadingState } from "@/components/feedback/loading-state";
import { useMfaStore } from "@/stores/mfa-store";

export function MfaPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mfaToken = useMfaStore((state) => state.mfaToken);
  const returnUrl = searchParams.get("returnUrl");

  useEffect(() => {
    if (!mfaToken) {
      router.replace("/login");
    }
  }, [mfaToken, router]);

  if (!mfaToken) {
    return <LoadingState variant="brand" label="Loading verification…" className="min-h-[50vh]" />;
  }

  return <MfaChallengeForm returnUrl={returnUrl} />;
}
