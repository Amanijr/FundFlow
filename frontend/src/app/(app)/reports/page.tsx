"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { ReportsNav } from "@/components/reports/reports-nav";
import { PageHeader } from "@/components/layout/page-header";
import { useOrganization } from "@/hooks/use-organization";
import { isChurchOrganization } from "@/lib/organization/verticals";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const ngoCategories = [
  {
    href: "/reports/financial",
    title: "Financial reports",
    description: "Income & expenditure, balance sheet, cash flow, fund activity",
  },
  {
    href: "/reports/donations",
    title: "Donation reports",
    description: "Giving trends, donor activity, donation sources",
  },
  {
    href: "/reports/campaigns",
    title: "Campaign reports",
    description: "Campaign performance and goal progress",
  },
  {
    href: "/reports/budgets",
    title: "Budget reports",
    description: "Budgeted vs actual spending and variance",
  },
];

const churchCategories = [
  {
    href: "/reports/donations",
    title: "Giving",
    description: "Completed gifts this year and by source",
  },
  {
    href: "/reports/members",
    title: "Members",
    description: "Active, inactive, and visitor counts",
  },
  {
    href: "/reports/attendance",
    title: "Attendance",
    description: "Headcount by service",
  },
  {
    href: "/reports/financial",
    title: "Funds and books",
    description: "Fund remaining, income and spend — treasurer view",
  },
];

export default function ReportsHubPage() {
  const organizationQuery = useOrganization();
  const church = isChurchOrganization(organizationQuery.data?.type);
  const categories = church ? churchCategories : ngoCategories;

  return (
    <div className="space-y-4">
      <PageHeader
        title="Reports"
        description={
          church
            ? "Giving, members, attendance, and funds — for council, not three ERP boards."
            : "Financial, fundraising, and budget reporting."
        }
      />
      <ReportsNav />

      <div className="overflow-hidden rounded-md border border-border bg-surface">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Report</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-16" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map(({ href, title, description }) => (
              <TableRow key={href}>
                <TableCell className="font-medium">
                  <Link href={href} className="text-primary hover:underline">
                    {title}
                  </Link>
                </TableCell>
                <TableCell className="text-muted-foreground">{description}</TableCell>
                <TableCell>
                  <Link href={href} className="inline-flex text-muted-foreground hover:text-primary" aria-label={`Open ${title}`}>
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
