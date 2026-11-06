import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  ClipboardCheck,
  HandCoins,
  Megaphone,
  Receipt,
  UserPlus,
  Users,
  Wallet,
} from "lucide-react";

import type { OrganizationType, Role } from "@/types/api";

export type HomeLayout =
  | "finance"
  | "fundraising"
  | "staff"
  | "admin"
  | "program"
  | "viewer";

export interface HomeTask {
  id: string;
  title: string;
  description: string;
  href: string;
  roles: Role[];
  emphasis?: "primary" | "secondary";
  icon: LucideIcon;
  organizationTypes?: OrganizationType[];
  excludeOrganizationTypes?: OrganizationType[];
}

export interface HomeChecklistItem {
  id: string;
  label: string;
  href: string;
  roles: Role[];
  organizationTypes?: OrganizationType[];
  excludeOrganizationTypes?: OrganizationType[];
}

export const homeTasks: HomeTask[] = [
  {
    id: "collection",
    title: "Record collection",
    description: "Count collected funds, then have finance verify",
    href: "/collections/new",
    roles: ["ORG_ADMIN", "FUNDRAISING_MANAGER", "STAFF"],
    emphasis: "primary",
    icon: HandCoins,
  },
  {
    id: "verify-collections",
    title: "Verify collections",
    description: "Confirm counts so they post to the books",
    href: "/collections",
    roles: ["ORG_ADMIN", "FINANCE_MANAGER"],
    emphasis: "primary",
    icon: ClipboardCheck,
  },
  {
    id: "record-donation",
    title: "Record donation",
    description: "Gift details, then cash / Lipa or pay later",
    href: "/donations/new",
    roles: ["ORG_ADMIN", "FUNDRAISING_MANAGER", "STAFF"],
    emphasis: "primary",
    icon: HandCoins,
  },
  {
    id: "add-donor",
    title: "Add a donor",
    description: "Create a donor profile before recording gifts",
    href: "/donors/new",
    roles: ["ORG_ADMIN", "FUNDRAISING_MANAGER", "STAFF"],
    emphasis: "secondary",
    icon: Users,
  },
  {
    id: "submit-expense",
    title: "Spend money",
    description: "Guided expense flow ending with approval",
    href: "/spend-money",
    roles: ["ORG_ADMIN", "FINANCE_MANAGER", "STAFF"],
    emphasis: "primary",
    icon: Receipt,
  },
  {
    id: "review-approvals",
    title: "Review approvals",
    description: "Clear pending expense and workflow items",
    href: "/approvals",
    roles: ["ORG_ADMIN", "FINANCE_MANAGER", "ACCOUNTANT", "PROGRAM_MANAGER"],
    emphasis: "primary",
    icon: ClipboardCheck,
  },
  {
    id: "create-campaign",
    title: "Start a campaign",
    description: "Set a fundraising target and track progress",
    href: "/campaigns/new",
    roles: ["ORG_ADMIN", "FUNDRAISING_MANAGER"],
    emphasis: "secondary",
    icon: Megaphone,
  },
  {
    id: "view-funds",
    title: "Review funds",
    description: "See balances and restricted money",
    href: "/funds",
    roles: ["ORG_ADMIN", "FINANCE_MANAGER", "ACCOUNTANT"],
    emphasis: "secondary",
    icon: Wallet,
  },
  {
    id: "view-reports",
    title: "Open reports",
    description: "Donation, budget, and financial summaries",
    href: "/reports",
    roles: [
      "ORG_ADMIN",
      "FINANCE_MANAGER",
      "FUNDRAISING_MANAGER",
      "ACCOUNTANT",
      "PROGRAM_MANAGER",
      "AUDITOR",
      "VIEW_ONLY",
    ],
    emphasis: "secondary",
    icon: BarChart3,
  },
  {
    id: "invite-user",
    title: "Invite a teammate",
    description: "Give finance or fundraising access",
    href: "/admin/users/new",
    roles: ["ORG_ADMIN"],
    emphasis: "secondary",
    icon: UserPlus,
  },
];

/** Short onboarding list — admin / fundraising only. */
export const homeChecklist: HomeChecklistItem[] = [
  {
    id: "collection",
    label: "Record a collection",
    href: "/collections/new",
    roles: ["ORG_ADMIN", "FUNDRAISING_MANAGER"],
  },
  {
    id: "donor",
    label: "Add a donor",
    href: "/donors/new",
    roles: ["ORG_ADMIN", "FUNDRAISING_MANAGER"],
  },
  {
    id: "donation",
    label: "Record a donation",
    href: "/donations/new",
    roles: ["ORG_ADMIN", "FUNDRAISING_MANAGER"],
  },
  {
    id: "fund",
    label: "Set up a fund",
    href: "/funds/new",
    roles: ["ORG_ADMIN"],
  },
];

export function homeLayoutForRole(role: Role): HomeLayout {
  switch (role) {
    case "FINANCE_MANAGER":
    case "ACCOUNTANT":
      return "finance";
    case "FUNDRAISING_MANAGER":
      return "fundraising";
    case "STAFF":
    case "VOLUNTEER":
      return "staff";
    case "PROGRAM_MANAGER":
      return "program";
    case "AUDITOR":
    case "VIEW_ONLY":
    case "DONOR":
      return "viewer";
    case "ORG_ADMIN":
    default:
      return "admin";
  }
}

function matchesOrganization(
  task: { organizationTypes?: OrganizationType[]; excludeOrganizationTypes?: OrganizationType[] },
  organizationType?: OrganizationType,
) {
  if (task.excludeOrganizationTypes?.length) {
    if (organizationType && task.excludeOrganizationTypes.includes(organizationType)) {
      return false;
    }
  }
  if (!task.organizationTypes) {
    return true;
  }
  if (!organizationType) {
    return false;
  }
  return task.organizationTypes.includes(organizationType);
}

export function tasksForRole(role: Role, organizationType?: OrganizationType) {
  return homeTasks.filter((task) => task.roles.includes(role) && matchesOrganization(task, organizationType));
}

export function checklistForRole(role: Role, organizationType?: OrganizationType) {
  return homeChecklist.filter((item) => item.roles.includes(role) && matchesOrganization(item, organizationType));
}

export function homeGreeting(role: Role, organizationType?: OrganizationType) {
  void organizationType;
  switch (role) {
    case "FINANCE_MANAGER":
    case "ACCOUNTANT":
      return "Cash, approvals, and spending — in that order.";
    case "FUNDRAISING_MANAGER":
      return "Donors, gifts, and campaigns.";
    case "STAFF":
    case "VOLUNTEER":
      return "Your everyday tasks.";
    case "ORG_ADMIN":
      return "Act first. Explore when you need to.";
    case "PROGRAM_MANAGER":
      return "Clear reviews, then check programs.";
    case "AUDITOR":
    case "VIEW_ONLY":
      return "Reports and activity — read only.";
    default:
      return "Here’s what matters for your role.";
  }
}

export function homeSectionTitle(layout: HomeLayout) {
  switch (layout) {
    case "finance":
      return "Finance today";
    case "fundraising":
      return "Fundraising today";
    case "staff":
      return "Your tasks";
    case "program":
      return "Programs today";
    case "viewer":
      return "Review";
    case "admin":
    default:
      return "Start here";
  }
}
