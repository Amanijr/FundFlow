"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { LoadingState } from "@/components/feedback/loading-state";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  return <ResetPasswordForm token={token} />;
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<LoadingState variant="brand" className="min-h-[50vh]" />}>
      <ResetPasswordContent />
    </Suspense>
  );
}
