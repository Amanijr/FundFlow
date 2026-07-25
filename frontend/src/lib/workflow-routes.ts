const ENTITY_ROUTES: Record<string, (id: string | number) => string> = {
  expense: (id) => `/expenses/${id}`,
  budget: (id) => `/budgets/${id}`,
  grant: (id) => `/grants/${id}`,
  donation: (id) => `/donations/${id}`,
  campaign: (id) => `/campaigns/${id}`,
  journal_entry: (id) => `/accounting/journal-entries/${id}`,
};

export function resolveWorkflowHref(entityType: string, entityId: string | number): string {
  const resolver = ENTITY_ROUTES[entityType];
  return resolver ? resolver(entityId) : `/approvals`;
}
