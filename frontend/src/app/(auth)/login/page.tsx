import { Suspense } from "react";

import { AuthSlider } from "@/components/auth/auth-slider";
import { LoadingState } from "@/components/feedback/loading-state";

export default function LoginPage() {
  return (
    <Suspense fallback={<LoadingState variant="brand" className="min-h-[50vh]" />}>
      <AuthSlider initialMode="sign-in" />
    </Suspense>
  );
}
