import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function SectionHeader({ title, description, action, className }: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "mb-[var(--space-3)] flex items-center justify-between gap-[var(--space-3)]",
        className,
      )}
    >
      <div className="min-w-0">
        <h2 className="text-section-heading">{title}</h2>
        {description && <p className="text-supporting">{description}</p>}
      </div>
      {action}
    </div>
  );
}
