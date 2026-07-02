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
      className={cn("content-reveal w-full px-4 py-4 sm:px-5 lg:px-6", className)}
    >
      {children}
    </div>
  );
}
