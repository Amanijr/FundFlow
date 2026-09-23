"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useOrganization } from "@/hooks/use-organization";
import { isChurchOrganization } from "@/lib/organization/verticals";
import { cn } from "@/lib/utils";

export function ReportsNav() {
  const pathname = usePathname();
  const organizationQuery = useOrganization();
  const church = isChurchOrganization(organizationQuery.data?.type);

  const links = church
    ? [
        { href: "/reports", label: "Overview", exact: true },
        { href: "/reports/donations", label: "Giving" },
        { href: "/reports/members", label: "Members" },
        { href: "/reports/attendance", label: "Attendance" },
        { href: "/reports/financial", label: "Funds & books" },
      ]
    : [
        { href: "/reports", label: "Overview", exact: true },
        { href: "/reports/financial", label: "Financial" },
        { href: "/reports/donations", label: "Donations" },
        { href: "/reports/campaigns", label: "Campaigns" },
        { href: "/reports/budgets", label: "Budgets" },
      ];

  return (
    <nav className="flex flex-wrap gap-1 border-b border-border">
      {links.map((link) => {
        const active = link.exact ? pathname === link.href : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "border-b-2 px-3 py-2 text-xs font-medium transition-colors -mb-px",
              active
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
