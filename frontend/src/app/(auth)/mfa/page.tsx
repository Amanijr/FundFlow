import { Suspense } from "react";

import { MfaPage } from "@/components/auth/mfa-page";
import { LoadingState } from "@/components/feedback/loading-state";

export default function Page() {
  return (
    <Suspense fallback={<LoadingState variant="brand" className="min-h-[50vh]" />}>
      <MfaPage />
    </Suspense>
  );
}
