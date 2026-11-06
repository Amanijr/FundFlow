"use client";

import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

interface ContentContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function ContentContainer({ children, className }: ContentContainerProps) {
  const pathname = usePathname();

  return (
    <div
      key={pathname}
      className={cn(
        "content-reveal w-full px-[var(--layout-content-padding)] py-[var(--space-6)] lg:px-[var(--layout-content-padding-lg)]",
        className,
      )}
    >
      {children}
    </div>
  );
}
