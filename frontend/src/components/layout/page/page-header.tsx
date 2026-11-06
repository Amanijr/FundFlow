import { Breadcrumbs, type BreadcrumbItem } from "@/components/layout/breadcrumb/breadcrumbs";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  breadcrumbs?: BreadcrumbItem[];
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function PageHeader({ breadcrumbs, title, description, action, className }: PageHeaderProps) {
  return (
    <div
      className={cn(
        "mb-[var(--space-6)] flex flex-col gap-[var(--space-2)] sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <div className="min-w-0 space-y-[var(--space-1)]">
        {breadcrumbs && breadcrumbs.length > 0 && <Breadcrumbs items={breadcrumbs} />}
        <div>
          <h1 className="text-page-heading tracking-tight">{title}</h1>
          {description && <p className="text-supporting">{description}</p>}
        </div>
      </div>
      {action && (
        <div className="flex shrink-0 flex-wrap items-center gap-[var(--space-2)]">{action}</div>
      )}
    </div>
  );
}
