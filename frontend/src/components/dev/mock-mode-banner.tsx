"use client";

import { isMockApiEnabled } from "@/lib/mock/config";
import { MOCK_DEMO_PASSWORD } from "@/lib/mock/fixtures";

export function MockModeBanner() {
  if (!isMockApiEnabled()) {
    return null;
  }

  return (
    <div className="fixed bottom-3 left-1/2 z-[100] w-[min(100%-1.5rem,36rem)] -translate-x-1/2 rounded-md border border-primary/30 bg-surface px-3 py-2 text-center text-xs shadow-sm">
      <span className="font-semibold text-primary">Mock API</span>
      <span className="text-muted-foreground">
        {" "}
        — no backend. Sign in with any email + password{" "}
        <code className="rounded bg-muted px-1 py-0.5 font-mono text-[11px]">{MOCK_DEMO_PASSWORD}</code>
      </span>
    </div>
  );
}
