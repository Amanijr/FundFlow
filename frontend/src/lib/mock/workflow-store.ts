import type {
  DelegatePayload,
  InboxFilters,
  InboxItem,
  ReassignPayload,
  WorkflowComment,
  WorkflowInstance,
  WorkflowTimelineEvent,
} from "@/types/workflow-instance";

const now = Date.now();

const INITIAL_INSTANCES: WorkflowInstance[] = [
  {
    id: "wf-expense-2",
    workflowType: "expense_approval",
    entityType: "expense",
    entityId: 2,
    title: "Expense: Office supplies",
    summary: "Reimbursement for administrative supplies",
    status: "in_review",
    currentStepId: "finance",
    currentStageLabel: "Finance review",
    amount: 85000,
    currency: "TZS",
    requestor: { id: 1, name: "Grace Admin" },
    submittedAt: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
    organizationId: 1,
    sla: {
      stepId: "finance",
      dueAt: new Date(now + 4 * 60 * 60 * 1000).toISOString(),
      status: "warning",
      percentElapsed: 72,
    },
    actions: {
      canApprove: true,
      canReject: true,
      canReturn: true,
      canDelegate: true,
      canReassign: false,
      canCancel: false,
      canComment: true,
    },
    steps: [
      {
        id: "submitted",
        label: "Submitted",
        strategy: "sequential",
        status: "completed",
        completedAt: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
        completedBy: "Grace Admin",
      },
      {
        id: "manager",
        label: "Manager",
        strategy: "sequential",
        status: "completed",
        completedAt: new Date(now - 90 * 60 * 1000).toISOString(),
        completedBy: "Sarah Kimaro",
        assignees: [{ userId: 3, name: "Sarah Kimaro", role: "PROGRAM_MANAGER" }],
      },
      {
        id: "finance",
        label: "Finance review",
        strategy: "sequential",
        status: "active",
        assignees: [{ userId: 2, name: "David Mwangi", role: "FINANCE_MANAGER" }],
      },
      {
        id: "complete",
        label: "Complete",
        strategy: "sequential",
        status: "pending",
      },
    ],
  },
  {
    id: "wf-budget-1",
    workflowType: "budget_approval",
    entityType: "budget",
    entityId: 1,
    title: "Budget: FY 2026 Operating",
    status: "approved",
    currentStepId: "complete",
    currentStageLabel: "Complete",
    requestor: { id: 2, name: "David Mwangi" },
    submittedAt: new Date(now - 10 * 24 * 60 * 60 * 1000).toISOString(),
    organizationId: 1,
    actions: {
      canApprove: false,
      canReject: false,
      canReturn: false,
      canDelegate: false,
      canReassign: false,
      canCancel: false,
      canComment: true,
    },
    steps: [
      { id: "submitted", label: "Submitted", strategy: "sequential", status: "completed" },
      { id: "finance", label: "Finance", strategy: "sequential", status: "completed", completedBy: "David Mwangi" },
      { id: "complete", label: "Complete", strategy: "sequential", status: "completed" },
    ],
  },
  {
    id: "wf-grant-1",
    workflowType: "grant_approval",
    entityType: "grant",
    entityId: 1,
    title: "Grant: Community health initiative",
    status: "pending",
    currentStepId: "program",
    currentStageLabel: "Program review",
    requestor: { id: 3, name: "Sarah Kimaro" },
    submittedAt: new Date(now - 24 * 60 * 60 * 1000).toISOString(),
    organizationId: 1,
    sla: {
      stepId: "program",
      dueAt: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
      status: "breached",
      percentElapsed: 100,
    },
    actions: {
      canApprove: true,
      canReject: true,
      canReturn: true,
      canDelegate: false,
      canReassign: true,
      canCancel: false,
      canComment: true,
    },
    steps: [
      { id: "submitted", label: "Submitted", strategy: "sequential", status: "completed" },
      {
        id: "program",
        label: "Program review",
        strategy: "sequential",
        status: "active",
        assignees: [{ userId: 4, name: "Program Manager" }],
      },
      { id: "finance", label: "Finance", strategy: "sequential", status: "pending" },
      { id: "complete", label: "Complete", strategy: "sequential", status: "pending" },
    ],
  },
];

const MOCK_COMMENTS: Record<string, WorkflowComment[]> = {
  "wf-expense-2": [
    {
      id: "c1",
      author: { id: 3, name: "Sarah Kimaro" },
      body: "Approved at manager level — receipts attached.",
      createdAt: new Date(now - 90 * 60 * 1000).toISOString(),
      visibility: "public",
    },
  ],
};

const MOCK_TIMELINES: Record<string, WorkflowTimelineEvent[]> = {
  "wf-expense-2": [
    {
      id: "t1",
      title: "Submitted for approval",
      actor: "Grace Admin",
      timestamp: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
      action: "submitted",
      status: "neutral",
    },
    {
      id: "t2",
      title: "Approved by Manager",
      description: "Sarah Kimaro approved this request.",
      actor: "Sarah Kimaro",
      timestamp: new Date(now - 90 * 60 * 1000).toISOString(),
      action: "approved",
      status: "success",
    },
    {
      id: "t3",
      title: "Assigned to Finance review",
      actor: "System",
      timestamp: new Date(now - 85 * 60 * 1000).toISOString(),
      action: "assigned",
      status: "neutral",
    },
  ],
};

let instances: WorkflowInstance[] = [...INITIAL_INSTANCES];

function buildInboxItem(instance: WorkflowInstance): InboxItem {
  const moduleMap: Record<string, string> = {
    expense: "Expenses",
    budget: "Budgets",
    grant: "Grants",
  };

  return {
    id: `inbox-${instance.id}`,
    workflowInstanceId: instance.id,
    title: instance.title,
    summary: instance.summary,
    module: moduleMap[instance.entityType] ?? instance.entityType,
    entityType: instance.entityType,
    entityId: instance.entityId,
    requestor: instance.requestor,
    submittedAt: instance.submittedAt ?? new Date().toISOString(),
    currentStage: instance.currentStepId,
    currentStageLabel: instance.currentStageLabel,
    status: instance.status,
    priority: instance.sla?.status === "breached" ? "high" : "normal",
    slaDueAt: instance.sla?.dueAt,
    slaBreached: instance.sla?.status === "breached",
    slaStatus: instance.sla?.status,
    actionRequired: instance.actions.canApprove && ["pending", "in_review"].includes(instance.status),
    href: `/${instance.entityType === "journal_entry" ? "accounting/journal-entries" : `${instance.entityType}s`}/${instance.entityId}`,
    amount: instance.amount,
    currency: instance.currency,
  };
}

export function getMockInbox(filters?: InboxFilters): InboxItem[] {
  let items = instances
    .filter((instance) => !["cancelled", "completed"].includes(instance.status) || filters?.status === "all")
    .map(buildInboxItem);

  if (filters?.status === "action_required") {
    items = items.filter((item) => item.actionRequired);
  } else if (filters?.status === "pending") {
    items = items.filter((item) => ["pending", "in_review", "waiting"].includes(item.status));
  }

  if (filters?.entityType) {
    items = items.filter((item) => item.entityType === filters.entityType);
  }
  if (filters?.q) {
    const lower = filters.q.toLowerCase();
    items = items.filter(
      (item) =>
        item.title.toLowerCase().includes(lower) ||
        item.requestor.name.toLowerCase().includes(lower),
    );
  }

  if (filters?.sort === "sla") {
    items.sort((a, b) => {
      if (a.slaBreached && !b.slaBreached) return -1;
      if (!a.slaBreached && b.slaBreached) return 1;
      return new Date(a.slaDueAt ?? 0).getTime() - new Date(b.slaDueAt ?? 0).getTime();
    });
  } else if (filters?.sort === "oldest") {
    items.sort((a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime());
  } else {
    items.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  }

  return items;
}

export function getMockInboxCount(): number {
  return getMockInbox({ status: "action_required" }).length;
}

export function getMockWorkflowInstance(id: string): WorkflowInstance | null {
  return instances.find((item) => item.id === id) ?? null;
}

export function getMockWorkflowByEntity(
  entityType: string,
  entityId: string | number,
): WorkflowInstance | null {
  return (
    instances.find(
      (item) => item.entityType === entityType && String(item.entityId) === String(entityId),
    ) ?? null
  );
}

export function getMockWorkflowComments(instanceId: string): WorkflowComment[] {
  return MOCK_COMMENTS[instanceId] ?? [];
}

export function addMockWorkflowComment(
  instanceId: string,
  body: string,
  visibility: "public" | "internal",
): WorkflowComment {
  const comment: WorkflowComment = {
    id: `c-${Date.now()}`,
    author: { id: 1, name: "Demo User" },
    body,
    createdAt: new Date().toISOString(),
    visibility,
  };
  MOCK_COMMENTS[instanceId] = [...(MOCK_COMMENTS[instanceId] ?? []), comment];
  return comment;
}

export function getMockWorkflowTimeline(instanceId: string): WorkflowTimelineEvent[] {
  return MOCK_TIMELINES[instanceId] ?? [];
}

function advanceWorkflow(instance: WorkflowInstance): WorkflowInstance {
  const activeIndex = instance.steps.findIndex((step) => step.status === "active");
  if (activeIndex === -1) return { ...instance, status: "approved" };

  const steps = instance.steps.map((step, index) => {
    if (index === activeIndex) {
      return { ...step, status: "completed" as const, completedAt: new Date().toISOString(), completedBy: "Demo User" };
    }
    if (index === activeIndex + 1) {
      return { ...step, status: "active" as const };
    }
    return step;
  });

  const nextActive = steps.find((step) => step.status === "active");
  const isComplete = !nextActive || nextActive.id === "complete";

  if (isComplete) {
    return {
      ...instance,
      status: "approved",
      currentStepId: "complete",
      currentStageLabel: "Complete",
      steps: steps.map((step) => (step.id === "complete" ? { ...step, status: "completed" } : step)),
      actions: { ...instance.actions, canApprove: false, canReject: false, canReturn: false },
    };
  }

  return {
    ...instance,
    status: "in_review",
    currentStepId: nextActive!.id,
    currentStageLabel: nextActive!.label,
    steps,
    actions: { ...instance.actions, canApprove: true },
  };
}

export function approveMockWorkflow(id: string, comment?: string): WorkflowInstance | null {
  const index = instances.findIndex((item) => item.id === id);
  if (index === -1) return null;
  if (comment) addMockWorkflowComment(id, comment, "public");
  instances[index] = advanceWorkflow(instances[index]);
  return instances[index];
}

export function rejectMockWorkflow(id: string, reason: string): WorkflowInstance | null {
  const index = instances.findIndex((item) => item.id === id);
  if (index === -1) return null;
  addMockWorkflowComment(id, reason, "public");
  instances[index] = {
    ...instances[index],
    status: "rejected",
    currentStageLabel: "Rejected",
    actions: { ...instances[index].actions, canApprove: false, canReject: false, canReturn: false },
    steps: instances[index].steps.map((step) =>
      step.status === "active" ? { ...step, status: "rejected" } : step,
    ),
  };
  return instances[index];
}

export function returnMockWorkflow(id: string, comment: string): WorkflowInstance | null {
  const index = instances.findIndex((item) => item.id === id);
  if (index === -1) return null;
  addMockWorkflowComment(id, comment, "public");
  instances[index] = {
    ...instances[index],
    status: "returned",
    currentStageLabel: "Returned",
    actions: { ...instances[index].actions, canApprove: false, canReject: false },
  };
  return instances[index];
}

export function delegateMockWorkflow(id: string, payload: DelegatePayload): WorkflowInstance | null {
  const index = instances.findIndex((item) => item.id === id);
  if (index === -1) return null;
  const instance = instances[index];
  const steps = instance.steps.map((step) => {
    if (step.status !== "active") return step;
    return {
      ...step,
      assignees: [
        {
          userId: payload.delegateUserId,
          name: "Delegated User",
          delegatedFrom: { userId: 2, name: "David Mwangi", until: payload.effectiveTo },
        },
      ],
    };
  });
  addMockWorkflowComment(id, `Delegated: ${payload.reason}`, "internal");
  instances[index] = { ...instance, steps };
  return instances[index];
}

export function reassignMockWorkflow(id: string, payload: ReassignPayload): WorkflowInstance | null {
  const index = instances.findIndex((item) => item.id === id);
  if (index === -1) return null;
  const instance = instances[index];
  const steps = instance.steps.map((step) => {
    if (step.status !== "active") return step;
    return {
      ...step,
      assignees: [{ userId: payload.assigneeUserId, name: "Reassigned User" }],
    };
  });
  addMockWorkflowComment(id, `Reassigned: ${payload.reason}`, "internal");
  instances[index] = { ...instance, steps };
  return instances[index];
}

export function resetMockWorkflows(): void {
  instances = [...INITIAL_INSTANCES];
}
