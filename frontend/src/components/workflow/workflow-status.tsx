import { WorkflowStepper } from "@/components/workflow/workflow-stepper";
import type { WorkflowStatusValue } from "@/types/workflow";

const steps: WorkflowStatusValue[] = ["DRAFT", "PENDING_REVIEW", "APPROVED", "COMPLETED"];

const labels: Record<WorkflowStatusValue, string> = {
  DRAFT: "Draft",
  PENDING_REVIEW: "Review",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  COMPLETED: "Completed",
  ARCHIVED: "Archived",
};

interface WorkflowStatusProps {
  current: WorkflowStatusValue;
  className?: string;
}

export function WorkflowStatus({ current, className }: WorkflowStatusProps) {
  return <WorkflowStepper steps={steps} current={current} labels={labels} className={className} />;
}
