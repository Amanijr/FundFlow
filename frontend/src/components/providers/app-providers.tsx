"use client";

import { MockModeBanner } from "@/components/dev/mock-mode-banner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { setMockApiEnabled } from "@/lib/mock/config";
import { useAuthStore } from "@/stores/auth-store";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { useEffect, useState } from "react";
import { Toaster } from "sonner";

export function AppProviders({
  children,
  mockApi = false,
}: {
  children: React.ReactNode;
  mockApi?: boolean;
}) {
  setMockApiEnabled(mockApi);

  const hasHydrated = useAuthStore((s) => s._hasHydrated);
  useEffect(() => {
    if (!hasHydrated || mockApi) {
      return;
    }
    const token = useAuthStore.getState().accessToken;
    if (token?.startsWith("mock-token-")) {
      useAuthStore.getState().clearSession();
    }
  }, [hasHydrated, mockApi]);

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000,
            retry: 1,
          },
        },
      }),
  );

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider delayDuration={300}>
          {children}
          <MockModeBanner />
          <Toaster richColors position="top-right" />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
