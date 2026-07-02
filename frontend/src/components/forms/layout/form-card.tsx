import { cn } from "@/lib/utils";

interface FormCardProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function FormCard({ title, description, children, className }: FormCardProps) {
  return (
    <div className={cn("rounded-md border border-border bg-surface", className)}>
      {(title || description) && (
        <div className="border-b border-border px-4 py-2.5">
          {title && <h2 className="text-sm font-semibold text-foreground">{title}</h2>}
          {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
        </div>
      )}
      <div className="space-y-6 p-4">{children}</div>
    </div>
  );
}
