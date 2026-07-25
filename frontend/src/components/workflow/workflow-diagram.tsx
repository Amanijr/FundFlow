import { Check } from "lucide-react";

import type { WorkflowStep } from "@/types/workflow-instance";
import { cn } from "@/lib/utils";

interface WorkflowDiagramProps {
  steps: WorkflowStep[];
  currentStepId: string;
  variant?: "horizontal" | "vertical";
  compact?: boolean;
  className?: string;
}

export function WorkflowDiagram({
  steps,
  currentStepId,
  variant = "horizontal",
  compact = false,
  className,
}: WorkflowDiagramProps) {
  if (variant === "vertical") {
    return (
      <nav aria-label="Approval progress" className={cn("space-y-4", className)}>
        <ol className="space-y-4">
          {steps.map((step, index) => (
            <li key={step.id} className="relative pl-6">
              {index < steps.length - 1 && (
                <span className="absolute left-[7px] top-4 h-full w-px bg-border" aria-hidden />
              )}
              <StepDot step={step} isCurrent={step.id === currentStepId} />
              <StepContent step={step} compact={compact} />
            </li>
          ))}
        </ol>
      </nav>
    );
  }

  return (
    <nav aria-label="Approval progress" className={cn("overflow-x-auto", className)}>
      <ol className="flex min-w-max items-center gap-2">
        {steps.map((step, index) => (
          <li key={step.id} className="flex items-center gap-2">
            {index > 0 && <span className="h-px w-6 bg-border" aria-hidden />}
            <div className="flex items-center gap-2">
              <StepDot step={step} isCurrent={step.id === currentStepId} horizontal />
              <StepContent step={step} compact horizontal />
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
}

function StepDot({
  step,
  isCurrent,
  horizontal = false,
}: {
  step: WorkflowStep;
  isCurrent: boolean;
  horizontal?: boolean;
}) {
  const base = horizontal
    ? "flex h-6 w-6 items-center justify-center rounded-full border-2 text-[10px]"
    : "absolute left-0 top-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full border-2";

  return (
    <span
      className={cn(
        base,
        step.status === "completed" && "border-emerald-600 bg-emerald-600 text-white",
        step.status === "active" && isCurrent && "border-stone-900 bg-stone-900 text-white",
        step.status === "pending" && "border-border bg-surface",
        step.status === "rejected" && "border-red-600 bg-red-600 text-white",
        step.status === "skipped" && "border-muted bg-muted",
      )}
      aria-current={isCurrent ? "step" : undefined}
    >
      {step.status === "completed" && horizontal && <Check className="h-3 w-3" />}
    </span>
  );
}

function StepContent({
  step,
  compact,
  horizontal = false,
}: {
  step: WorkflowStep;
  compact?: boolean;
  horizontal?: boolean;
}) {
  return (
    <div className={horizontal ? "min-w-0" : "space-y-1"}>
      <p
        className={cn(
          "font-medium text-foreground",
          compact || horizontal ? "text-xs" : "text-sm",
          step.status === "pending" && "text-muted-foreground",
        )}
      >
        {step.label}
        {step.status === "skipped" && (
          <span className="ml-1 text-muted-foreground">(skipped)</span>
        )}
      </p>
      {!horizontal && step.assignees?.[0] && (
        <p className="text-xs text-muted-foreground">
          {step.assignees[0].name}
          {step.assignees[0].delegatedFrom &&
            ` · delegated from ${step.assignees[0].delegatedFrom.name}`}
        </p>
      )}
      {step.conditionLabel && (
        <p className="text-xs text-muted-foreground">{step.conditionLabel}</p>
      )}
    </div>
  );
}
