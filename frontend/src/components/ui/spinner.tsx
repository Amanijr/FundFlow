import { cn } from "@/lib/utils";

const sizeMap = {
  sm: { dot: "h-1 w-1", gap: "gap-1" },
  default: { dot: "h-1.5 w-1.5", gap: "gap-1.5" },
  lg: { dot: "h-2 w-2", gap: "gap-2" },
} as const;

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: keyof typeof sizeMap;
  label?: string;
}

export function Spinner({ size = "default", label = "Loading…", className, ...props }: SpinnerProps) {
  const s = sizeMap[size];

  return (
    <div role="status" className={cn("inline-flex items-center", s.gap, className)} {...props}>
      {[0, 1, 2].map((index) => (
        <span
          key={index}
          className={cn("loader-dot rounded-full bg-muted-foreground", s.dot)}
          style={{ animationDelay: `${index * 120}ms` }}
          aria-hidden
        />
      ))}
      <span className="sr-only">{label}</span>
    </div>
  );
}
