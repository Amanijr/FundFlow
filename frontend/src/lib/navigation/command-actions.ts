import type { OrganizationType, Role } from "@/types/api";
import type { CommandAction } from "@/components/navigation/command-palette";
import { navigationGroups } from "@/lib/navigation/navigation";
import { canAccessNavItem } from "@/lib/navigation/permissions";

export function buildCommandActions(role?: Role, organizationType?: OrganizationType): CommandAction[] {
  const navigationActions: CommandAction[] = navigationGroups.flatMap((group) =>
    group.items
      .filter((item) => canAccessNavItem(item.roles, role, organizationType, item.organizationTypes))
      .map((item) => ({
        id: item.id,
        label: item.label,
        group: group.label,
        href: item.href,
      })),
  );

  const quickActions: CommandAction[] = [];

  if (role && ["ORG_ADMIN", "FUNDRAISING_MANAGER", "STAFF"].includes(role)) {
    quickActions.push(
      {
        id: "record-donation",
        label: "Record donation",
        group: "Quick actions",
        href: "/donations/new",
      },
      {
        id: "add-donor",
        label: "Add donor",
        group: "Quick actions",
        href: "/donors/new",
      },
      {
        id: "create-campaign",
        label: "Create campaign",
        group: "Quick actions",
        href: "/campaigns/new",
      },
    );
  }

  if (role && ["ORG_ADMIN", "FINANCE_MANAGER", "STAFF"].includes(role)) {
    quickActions.push({
      id: "create-expense",
      label: "Create expense",
      group: "Quick actions",
      href: "/expenses/new",
    });
  }

  const reportActions: CommandAction[] = [
    { id: "reports-hub", label: "Report center", group: "Reports", href: "/reports" },
    { id: "reports-financial", label: "Financial reports", group: "Reports", href: "/reports/financial" },
    { id: "reports-donations", label: "Donation reports", group: "Reports", href: "/reports/donations" },
    { id: "reports-campaigns", label: "Campaign reports", group: "Reports", href: "/reports/campaigns" },
    { id: "reports-budgets", label: "Budget reports", group: "Reports", href: "/reports/budgets" },
  ];

  return [...quickActions, ...reportActions, ...navigationActions];
}
