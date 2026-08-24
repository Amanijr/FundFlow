"use client";

import Link from "next/link";
import { ArrowRight, Church, ClipboardList, HandCoins, Users } from "lucide-react";

import { ChurchNav } from "@/components/church/church-nav";
import { PageHeader } from "@/components/layout/page-header";
import { PermissionGate } from "@/components/security/permission-gate";
import { Button } from "@/components/ui/button";

const churchWork = [
  {
    href: "/church/collections",
    title: "Sunday collections",
    description: "Count the offering, then the treasurer verifies it onto the books.",
    icon: HandCoins,
  },
  {
    href: "/donations/new",
    title: "Record a member gift",
    description: "Zaka, sadaka, or a named gift — cash, Lipa, or pay later.",
    icon: Church,
  },
  {
    href: "/church/attendance",
    title: "Service attendance",
    description: "Headcount for Sunday and midweek services.",
    icon: ClipboardList,
  },
  {
    href: "/church/ministries",
    title: "Ministries",
    description: "Youth, worship, cells, and other departments.",
    icon: Users,
  },
];

export default function ChurchHomePage() {
  return (
    <div className="space-y-4">
      <ChurchNav />
      <PageHeader
        breadcrumbs={[{ label: "Church" }]}
        title="Church"
        description="Sunday offering, member gifts, ministries, and attendance."
        action={
          <PermissionGate roles={["ORG_ADMIN", "FUNDRAISING_MANAGER", "STAFF"]}>
            <Button asChild>
              <Link href="/church/collections/new">New Sunday collection</Link>
            </Button>
          </PermissionGate>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2">
        {churchWork.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="group flex gap-3 rounded-xl border border-border bg-surface p-4 transition-colors hover:border-foreground/15 hover:bg-muted/30"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground">
                <Icon className="h-4 w-4" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium text-foreground">{item.title}</p>
                  <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </div>
                <p className="mt-0.5 text-sm text-muted-foreground">{item.description}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
