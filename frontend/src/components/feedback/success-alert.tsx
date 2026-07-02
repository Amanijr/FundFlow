import { CheckCircle2 } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

interface SuccessAlertProps {
  message: string;
  className?: string;
}

export function SuccessAlert({ message, className }: SuccessAlertProps) {
  if (!message) {
    return null;
  }

  return (
    <Alert variant="success" className={cn(className)}>
      <CheckCircle2 className="h-4 w-4" />
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}
