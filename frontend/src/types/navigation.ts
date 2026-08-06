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
  /** Primary stays visible; secondary lives under More (hidden in Simple mode). */
  priority?: NavPriority;
}

export interface NavGroup {
  id: string;
  label: string;
  items: NavItem[];
  defaultCollapsed?: boolean;
}
