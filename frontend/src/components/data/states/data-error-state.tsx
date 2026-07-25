import { AlertCircle } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface DataErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  onRefresh?: () => void;
  className?: string;
}

export function DataErrorState({
  title = "Unable to load data",
  description = "Something went wrong while fetching records. Please try again.",
  onRetry,
  onRefresh,
  className,
}: DataErrorStateProps) {
  const handleRetry = onRetry ?? onRefresh;

  return (
    <Alert variant="destructive" className={cn(className)} role="alert">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="flex flex-col gap-3">
        <span>{description}</span>
        {handleRetry && (
          <div>
            <Button type="button" size="sm" variant="outline" onClick={handleRetry}>
              Try again
            </Button>
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
}
