import { AlertTriangle } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

interface WarningAlertProps {
  message: string;
  className?: string;
}

export function WarningAlert({ message, className }: WarningAlertProps) {
  if (!message) {
    return null;
  }

  return (
    <Alert variant="warning" className={cn(className)}>
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}
