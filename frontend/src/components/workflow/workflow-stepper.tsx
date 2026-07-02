import { cn } from "@/lib/utils";

interface WorkflowStepperProps {
  steps: readonly string[];
  current: string;
  labels?: Record<string, string>;
  rejectedStep?: string;
  className?: string;
}

function formatLabel(step: string, labels?: Record<string, string>) {
  return labels?.[step] ?? step.replaceAll("_", " ");
}

export function WorkflowStepper({ steps, current, labels, rejectedStep = "REJECTED", className }: WorkflowStepperProps) {
  const isRejected = current === rejectedStep;
  const displaySteps = isRejected ? [steps[0], rejectedStep] : steps;
  const currentIndex = isRejected ? 1 : displaySteps.indexOf(current);

  return (
    <nav aria-label="Workflow progress" className={cn("border-b border-border", className)}>
      <ol className="flex flex-wrap">
        {displaySteps.map((step, index) => {
          const isComplete = index < currentIndex;
          const isCurrent = step === current;
          const isUpcoming = index > currentIndex;

          return (
            <li key={step} className="flex items-center">
              {index > 0 && <span className="mx-1 h-px w-4 bg-border" aria-hidden />}
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 border-b-2 px-3 py-2 text-xs font-medium transition-colors -mb-px",
                  isCurrent && "border-primary text-primary",
                  isComplete && !isCurrent && "border-transparent text-foreground",
                  isUpcoming && "border-transparent text-muted-foreground",
                  isRejected && step === rejectedStep && isCurrent && "border-danger text-danger",
                )}
              >
                <span
                  className={cn(
                    "flex h-5 w-5 items-center justify-center rounded-sm text-[10px] font-semibold",
                    isCurrent && !isRejected && "bg-primary text-primary-foreground",
                    isCurrent && isRejected && step === rejectedStep && "bg-danger text-destructive-foreground",
                    isComplete && "bg-muted text-muted-foreground",
                    isUpcoming && "bg-muted/60 text-muted-foreground",
                  )}
                >
                  {index + 1}
                </span>
                {formatLabel(step, labels)}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
