"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Toaster } from "sonner";

/** Sonner toaster synced to resolved light/dark theme. */
export function ThemeToaster() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const theme = mounted && resolvedTheme === "dark" ? "dark" : "light";

  return <Toaster theme={theme} richColors position="top-right" closeButton />;
}
