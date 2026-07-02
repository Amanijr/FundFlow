import { Badge } from "@/components/ui/badge";
import type { LogSeverity, LogType } from "@/types/platform";

const severityVariant: Record<LogSeverity, "secondary" | "warning" | "danger" | "outline"> = {
  INFO: "secondary",
  WARNING: "warning",
  ERROR: "danger",
  CRITICAL: "danger",
};

const typeLabels: Record<LogType, string> = {
  EVENT: "Event",
  ERROR: "Error",
  EXCEPTION: "Exception",
  ALERT: "Alert",
  SECURITY: "Security",
};

export function LogSeverityBadge({ severity }: { severity: LogSeverity }) {
  return <Badge variant={severityVariant[severity]}>{severity}</Badge>;
}

export function LogTypeBadge({ type }: { type: LogType }) {
  return <Badge variant="outline">{typeLabels[type]}</Badge>;
}
