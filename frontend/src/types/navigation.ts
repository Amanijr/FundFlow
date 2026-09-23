import type { OrganizationType, Role } from "@/types/api";
import type { LucideIcon } from "lucide-react";

export type NavPriority = "primary" | "secondary";

export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  roles: Role[];
  organizationTypes?: OrganizationType[];
  excludeOrganizationTypes?: OrganizationType[];
  /** Use exact so a parent path like /church does not stay active on /church/collections. */
  match?: "prefix" | "exact";
  /** Primary stays visible; secondary lives under More (hidden in Simple mode). */
  priority?: NavPriority;
}

export interface NavGroup {
  id: string;
  label: string;
  items: NavItem[];
  defaultCollapsed?: boolean;
  /** Hide the section heading (used for a lone Home link at the top). */
  hideLabel?: boolean;
}
