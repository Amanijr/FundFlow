"use client";

import Link from "next/link";
import { DollarSign, HandCoins, PiggyBank, Receipt, UserPlus } from "lucide-react";

import { useAuth } from "@/hooks/use-auth";
import { SectionHeader } from "@/components/layout/section-header";
import { Button } from "@/components/ui/button";
import type { Role } from "@/types/api";

interface QuickAction {
  id: string;
  label: string;
  href: string;
  roles: Role[];
  icon: React.ComponentType<{ className?: string }>;
}

const quickActions: QuickAction[] = [
  { id: "donation", label: "Record donation", href: "/donations/new", roles: ["ORG_ADMIN", "FUNDRAISING_MANAGER", "STAFF"], icon: HandCoins },
  { id: "donor", label: "Add donor", href: "/donors/new", roles: ["ORG_ADMIN", "FUNDRAISING_MANAGER", "STAFF"], icon: UserPlus },
  { id: "campaign", label: "Create campaign", href: "/campaigns/new", roles: ["ORG_ADMIN", "FUNDRAISING_MANAGER", "STAFF"], icon: DollarSign },
  { id: "expense", label: "Record expense", href: "/expenses/new", roles: ["ORG_ADMIN", "FINANCE_MANAGER", "ACCOUNTANT", "STAFF"], icon: Receipt },
  { id: "budget", label: "Create budget", href: "/budgets/new", roles: ["ORG_ADMIN", "FINANCE_MANAGER"], icon: PiggyBank },
];

export function QuickActionCard() {
  const { user } = useAuth();
  const visible = quickActions.filter((action) => user && action.roles.includes(user.role));

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
