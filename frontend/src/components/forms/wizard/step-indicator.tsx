"use client";

import { cn } from "@/lib/utils";

export interface WizardStep {
  id: string;
  title: string;
  description?: string;
}

interface StepIndicatorProps {
  steps: readonly WizardStep[];
  currentIndex: number;
  onStepClick?: (index: number) => void;
  className?: string;
}

export function StepIndicator({ steps, currentIndex, onStepClick, className }: StepIndicatorProps) {
  return (
    <nav aria-label="Form progress" className={cn("border-b border-border", className)}>
      <ol className="flex flex-wrap">
        {steps.map((step, index) => {
          const isComplete = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isUpcoming = index > currentIndex;
          const canClick = isComplete && onStepClick;

          return (
            <li key={step.id} className="flex items-center">
              {index > 0 && <span className="mx-1 h-px w-4 bg-border" aria-hidden />}
              <button
                type="button"
                className={cn(
                  "inline-flex items-center gap-1.5 border-b-2 px-3 py-2 text-xs font-medium transition-colors -mb-px",
                  isCurrent && "border-primary text-primary",
                  isComplete && !isCurrent && "border-transparent text-foreground",
                  isUpcoming && "border-transparent text-muted-foreground",
                  canClick && "hover:text-foreground",
                  !canClick && "cursor-default",
                )}
                onClick={canClick ? () => onStepClick(index) : undefined}
                aria-current={isCurrent ? "step" : undefined}
                disabled={isUpcoming}
              >
                <span
                  className={cn(
                    "flex h-5 w-5 items-center justify-center rounded-sm text-[10px] font-semibold",
                    isCurrent && "bg-primary text-primary-foreground",
                    isComplete && "bg-muted text-muted-foreground",
                    isUpcoming && "bg-muted/60 text-muted-foreground",
                  )}
                >
                  {index + 1}
                </span>
                <span className="hidden sm:inline">{step.title}</span>
                <span className="sr-only sm:hidden">
                  Step {index + 1} of {steps.length}: {step.title}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
