import type { OrganizationType, Role } from "@/types/api";
import type { CommandAction } from "@/components/navigation/command-palette";
import { navigationGroups } from "@/lib/navigation/navigation";
import { canAccessNavItem } from "@/lib/navigation/permissions";

export function buildCommandActions(role?: Role, organizationType?: OrganizationType): CommandAction[] {
  const navigationActions: CommandAction[] = navigationGroups.flatMap((group) => {
    if (group.id === "developer" && process.env.NODE_ENV !== "development") {
      return [];
    }
    return group.items
      .filter((item) =>
        canAccessNavItem(
          item.roles,
          role,
          organizationType,
          item.organizationTypes,
          item.excludeOrganizationTypes,
        ),
      )
      .map((item) => ({
        id: item.id,
        label: item.label,
        group: group.label,
        href: item.href,
      }));
  });

  const quickActions: CommandAction[] = [];

  if (role && ["ORG_ADMIN", "FUNDRAISING_MANAGER", "STAFF"].includes(role)) {
    quickActions.push(
      {
        id: "record-collection",
        label: "Record collection",
        group: "Quick actions",
        href: "/collections/new",
      },
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
    );
    quickActions.push({
      id: "create-campaign",
      label: "Create campaign",
      group: "Quick actions",
      href: "/campaigns/new",
    });
  }

  if (role && ["ORG_ADMIN", "FINANCE_MANAGER", "STAFF"].includes(role)) {
    quickActions.push({
      id: "create-expense",
      label: "Spend money",
      group: "Quick actions",
      href: "/spend-money",
    });
  }

  const reportActions: CommandAction[] = [
    { id: "reports-hub", label: "Report center", group: "Reports", href: "/reports" },
    { id: "reports-financial", label: "Financial reports", group: "Reports", href: "/reports/financial" },
    { id: "reports-donations", label: "Donation reports", group: "Reports", href: "/reports/donations" },
    { id: "reports-campaigns", label: "Campaign reports", group: "Reports", href: "/reports/campaigns" },
    { id: "reports-budgets", label: "Budget reports", group: "Reports", href: "/reports/budgets" },
  ];

  const accountActions: CommandAction[] = [
    { id: "my-profile", label: "My profile", group: "Account", href: "/settings/profile" },
    {
      id: "notification-prefs",
      label: "Preferences",
      group: "Account",
      href: "/settings/notifications",
    },
  ];

  return [...quickActions, ...reportActions, ...accountActions, ...navigationActions];
}
