import { AlertTriangle, Info, X } from "lucide-react";
import Link from "next/link";

import type { SystemAnnouncement } from "@/types/notification";
import { cn } from "@/lib/utils";

interface BannerAlertProps {
  announcement: SystemAnnouncement;
  onDismiss?: (id: string) => void;
}

const SEVERITY_STYLES = {
  info: "border-blue-200 bg-blue-50 text-blue-950",
  warning: "border-amber-200 bg-amber-50 text-amber-950",
  critical: "border-red-200 bg-red-50 text-red-950",
};

const SEVERITY_ICONS = {
  info: Info,
  warning: AlertTriangle,
  critical: AlertTriangle,
};

export function BannerAlert({ announcement, onDismiss }: BannerAlertProps) {
  const Icon = SEVERITY_ICONS[announcement.severity];
  const role = announcement.severity === "critical" ? "alert" : "status";

  const content = (
    <div
      role={role}
      className={cn(
        "flex items-start gap-3 border-b px-4 py-2.5 text-sm",
        SEVERITY_STYLES[announcement.severity],
      )}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="font-medium">{announcement.title}</p>
        {announcement.description && (
          <p className="mt-0.5 text-xs opacity-90">{announcement.description}</p>
        )}
      </div>
      {announcement.dismissible && onDismiss && (
        <button
          type="button"
          onClick={() => onDismiss(announcement.id)}
          className="rounded-sm p-1 opacity-70 transition-opacity hover:opacity-100"
          aria-label="Dismiss announcement"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );

  if (announcement.href) {
    return (
      <Link href={announcement.href} className="block hover:opacity-95">
        {content}
      </Link>
    );
  }

  return content;
}
