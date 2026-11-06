import type { NotificationLink } from "@/types/notification";

const ENTITY_ROUTES: Record<string, (id: string | number) => string> = {
  donation: (id) => `/donations/${id}`,
  expense: (id) => `/expenses/${id}`,
  budget: (id) => `/budgets/${id}`,
  campaign: (id) => `/campaigns/${id}`,
  donor: (id) => `/donors/${id}`,
  grant: (id) => `/grants/${id}`,
  user: () => `/admin/users`,
  report: () => `/reports`,
};

export function resolveNotificationHref(link?: NotificationLink): string | undefined {
  if (!link) return undefined;
  if (link.href) return link.href;

  const resolver = ENTITY_ROUTES[link.entityType];
  if (resolver) return resolver(link.entityId);

  return undefined;
}
