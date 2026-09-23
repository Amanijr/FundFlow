import type { OrganizationType, Role } from "@/types/api";
import type { CommandAction } from "@/components/navigation/command-palette";
import { navigationGroups } from "@/lib/navigation/navigation";
import { canAccessNavItem } from "@/lib/navigation/permissions";
import { isChurchOrganization } from "@/lib/organization/verticals";

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
  const church = isChurchOrganization(organizationType);

  if (role && ["ORG_ADMIN", "FUNDRAISING_MANAGER", "STAFF"].includes(role)) {
    if (church) {
      quickActions.push({
        id: "sunday-collection",
        label: "Sunday collection",
        group: "Quick actions",
        href: "/church/collections/new",
      });
      quickActions.push({
        id: "add-partnership",
        label: "Add partnership",
        group: "Quick actions",
        href: "/church/partnerships/new",
      });
      quickActions.push({
        id: "record-attendance",
        label: "Record attendance",
        group: "Quick actions",
        href: "/church/attendance",
      });
    }
    quickActions.push(
      {
        id: "record-donation",
        label: church ? "Record member gift" : "Record donation",
        group: "Quick actions",
        href: "/donations/new",
      },
      {
        id: "add-donor",
        label: church ? "Add member" : "Add donor",
        group: "Quick actions",
        href: church ? "/members/new" : "/donors/new",
      },
    );
    if (!church) {
      quickActions.push({
        id: "create-campaign",
        label: "Create campaign",
        group: "Quick actions",
        href: "/campaigns/new",
      });
    }
  }

  if (role && ["ORG_ADMIN", "FINANCE_MANAGER", "STAFF"].includes(role)) {
    quickActions.push({
      id: "create-expense",
      label: "Spend money",
      group: "Quick actions",
      href: "/spend-money",
    });
  }

  const reportActions: CommandAction[] = church
    ? [
        { id: "reports-hub", label: "Reports", group: "Reports", href: "/reports" },
        { id: "reports-giving", label: "Giving", group: "Reports", href: "/reports/donations" },
        { id: "reports-members", label: "Members", group: "Reports", href: "/reports/members" },
        { id: "reports-attendance", label: "Attendance", group: "Reports", href: "/reports/attendance" },
        { id: "reports-financial", label: "Funds and books", group: "Reports", href: "/reports/financial" },
      ]
    : [
        { id: "reports-hub", label: "Report center", group: "Reports", href: "/reports" },
        { id: "reports-financial", label: "Financial reports", group: "Reports", href: "/reports/financial" },
        { id: "reports-donations", label: "Donation reports", group: "Reports", href: "/reports/donations" },
        { id: "reports-campaigns", label: "Campaign reports", group: "Reports", href: "/reports/campaigns" },
        { id: "reports-budgets", label: "Budget reports", group: "Reports", href: "/reports/budgets" },
      ];

  return [...quickActions, ...reportActions, ...navigationActions];
}
