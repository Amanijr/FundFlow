import { cn } from "@/lib/utils";

const sizeClasses = {
  sm: "h-4 w-4 border-2",
  default: "h-5 w-5 border-2",
  lg: "h-8 w-8 border-[3px]",
} as const;

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: keyof typeof sizeClasses;
  label?: string;
}

export function Spinner({ size = "default", label = "Loading…", className, ...props }: SpinnerProps) {
  return (
    <div role="status" className={cn("inline-flex", className)} {...props}>
      <div
        className={cn("loader-spin rounded-full border-muted border-t-primary", sizeClasses[size])}
        aria-hidden
      />
      <span className="sr-only">{label}</span>
    </div>
  );
}
