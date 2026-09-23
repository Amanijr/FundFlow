"use client";

import Link from "next/link";
import { DollarSign, HandCoins, PiggyBank, Receipt, UserPlus } from "lucide-react";

import { useAuth } from "@/hooks/use-auth";
import { useOrganization } from "@/hooks/use-organization";
import { SectionHeader } from "@/components/layout/section-header";
import { Button } from "@/components/ui/button";
import type { OrganizationType, Role } from "@/types/api";

interface QuickAction {
  id: string;
  label: string;
  href: string;
  roles: Role[];
  icon: React.ComponentType<{ className?: string }>;
  organizationTypes?: OrganizationType[];
  excludeOrganizationTypes?: OrganizationType[];
}

const quickActions: QuickAction[] = [
  {
    id: "collection",
    label: "Sunday collection",
    href: "/church/collections/new",
    roles: ["ORG_ADMIN", "FUNDRAISING_MANAGER", "STAFF"],
    icon: HandCoins,
    organizationTypes: ["CHURCH", "RELIGIOUS_INSTITUTION"],
  },
  {
    id: "donation",
    label: "Record donation",
    href: "/donations/new",
    roles: ["ORG_ADMIN", "FUNDRAISING_MANAGER", "STAFF"],
    icon: HandCoins,
    excludeOrganizationTypes: ["CHURCH", "RELIGIOUS_INSTITUTION"],
  },
  {
    id: "member-gift",
    label: "Record member gift",
    href: "/donations/new",
    roles: ["ORG_ADMIN", "FUNDRAISING_MANAGER", "STAFF"],
    icon: HandCoins,
    organizationTypes: ["CHURCH", "RELIGIOUS_INSTITUTION"],
  },
  {
    id: "donor",
    label: "Add donor",
    href: "/donors/new",
    roles: ["ORG_ADMIN", "FUNDRAISING_MANAGER", "STAFF"],
    icon: UserPlus,
    excludeOrganizationTypes: ["CHURCH", "RELIGIOUS_INSTITUTION"],
  },
  {
    id: "member",
    label: "Add member",
    href: "/members/new",
    roles: ["ORG_ADMIN", "FUNDRAISING_MANAGER", "STAFF"],
    icon: UserPlus,
    organizationTypes: ["CHURCH", "RELIGIOUS_INSTITUTION"],
  },
  {
    id: "campaign",
    label: "Create campaign",
    href: "/campaigns/new",
    roles: ["ORG_ADMIN", "FUNDRAISING_MANAGER", "STAFF"],
    icon: DollarSign,
    excludeOrganizationTypes: ["CHURCH", "RELIGIOUS_INSTITUTION"],
  },
  { id: "expense", label: "Spend money", href: "/spend-money", roles: ["ORG_ADMIN", "FINANCE_MANAGER", "ACCOUNTANT", "STAFF"], icon: Receipt },
  { id: "budget", label: "Create budget", href: "/budgets/new", roles: ["ORG_ADMIN", "FINANCE_MANAGER"], icon: PiggyBank },
];

export function QuickActionCard() {
  const { user } = useAuth();
  const organizationQuery = useOrganization();
  const organizationType = organizationQuery.data?.type ?? user?.organizationType ?? undefined;
  const visible = quickActions.filter((action) => {
    if (!user || !action.roles.includes(user.role)) {
      return false;
    }
    if (action.excludeOrganizationTypes && organizationType && action.excludeOrganizationTypes.includes(organizationType)) {
      return false;
    }
    if (action.organizationTypes) {
      return Boolean(organizationType && action.organizationTypes.includes(organizationType));
    }
    return true;
  });

  if (visible.length === 0) return null;

  return (
    <section className="space-y-2">
      <SectionHeader title="Quick actions" description="Common tasks for your role" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {visible.map((action) => {
          const Icon = action.icon;
          return (
            <Button key={action.id} variant="outline" className="h-auto min-h-11 flex-col gap-2 py-3" asChild>
              <Link href={action.href}>
                <Icon className="h-4 w-4" />
                <span className="text-xs font-medium">{action.label}</span>
              </Link>
            </Button>
          );
        })}
      </div>
    </section>
  );
}
