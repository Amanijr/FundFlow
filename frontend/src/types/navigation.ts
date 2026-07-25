import type { OrganizationType, Role } from "@/types/api";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  roles: Role[];
  organizationTypes?: OrganizationType[];
}

export interface NavGroup {
  id: string;
  label: string;
  items: NavItem[];
}
