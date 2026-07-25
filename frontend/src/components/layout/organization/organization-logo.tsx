import { cn } from "@/lib/utils";

const sizeMap = {
  sm: "h-7 w-7 text-[10px] rounded-md",
  md: "h-9 w-9 text-xs rounded-md",
  lg: "h-12 w-12 text-sm rounded-lg",
} as const;

interface OrganizationLogoProps {
  name: string;
  size?: keyof typeof sizeMap;
  className?: string;
}

export function OrganizationLogo({ name, size = "md", className }: OrganizationLogoProps) {
  const initial = name.trim().charAt(0).toUpperCase() || "O";

  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center border border-border bg-accent/40 font-nav font-bold text-foreground",
        sizeMap[size],
        className,
      )}
      aria-hidden
    >
      {initial}
    </span>
  );
}
