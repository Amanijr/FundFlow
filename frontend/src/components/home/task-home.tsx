"use client";

import Link from "next/link";
import { ArrowRight, Check, LayoutDashboard } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useInboxCount } from "@/hooks/use-workflow";
import {
  checklistForRole,
  homeGreeting,
  homeLayoutForRole,
  homeSectionTitle,
  tasksForRole,
  type HomeLayout,
  type HomeTask,
} from "@/lib/navigation/home-tasks";
import { getRoleOverviewPath } from "@/lib/navigation/permissions";
import { cn } from "@/lib/utils";

function TaskCard({ task, featured }: { task: HomeTask; featured?: boolean }) {
  const Icon = task.icon;

  return (
    <Link
      href={task.href}
      className={cn(
        "group flex gap-3 rounded-xl border border-border bg-surface p-4 transition-colors",
        "hover:border-foreground/15 hover:bg-muted/30",
        featured && "sm:col-span-2 sm:p-5",
      )}
    >
      <span
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground",
          featured && "h-10 w-10",
        )}
      >
        <Icon className={cn("h-4 w-4", featured && "h-5 w-5")} aria-hidden />
      </span>
      <div className="min-w-0 flex-1 space-y-0.5">
        <div className="flex items-start justify-between gap-2">
          <p className={cn("font-medium text-foreground", featured && "text-base")}>{task.title}</p>
          <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
        </div>
        <p className="text-sm text-muted-foreground">{task.description}</p>
      </div>
    </Link>
  );
}

function SecondaryLinks({ tasks }: { tasks: HomeTask[] }) {
  if (tasks.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {tasks.map((task) => {
        const Icon = task.icon;
        return (
          <Button key={task.id} variant="outline" size="sm" asChild>
            <Link href={task.href} className="gap-1.5">
              <Icon className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
              {task.title}
            </Link>
          </Button>
        );
      })}
    </div>
  );
}

function ApprovalsCallout({ count }: { count: number }) {
  if (count <= 0) return null;

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border border-l-4 border-l-amber-500 bg-surface px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-medium text-foreground">
          {count} item{count === 1 ? "" : "s"} waiting for review
        </p>
        <p className="text-sm text-muted-foreground">Clear these so work stays unblocked.</p>
      </div>
      <Button size="sm" asChild>
        <Link href="/approvals">
          Open approvals
          <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
        </Link>
      </Button>
    </div>
  );
}

function Checklist({
  items,
}: {
  items: { id: string; label: string; href: string }[];
}) {
  if (items.length === 0) return null;

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Getting started
      </p>
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item.id}>
            <Link
              href={item.href}
              className="flex items-center gap-2 rounded-md px-1 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground"
            >
              <Check className="h-3.5 w-3.5 shrink-0" aria-hidden />
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function TaskGrid({
  layout,
  primary,
  secondary,
}: {
  layout: HomeLayout;
  primary: HomeTask[];
  secondary: HomeTask[];
}) {
  const title = homeSectionTitle(layout);

  if (layout === "finance") {
    const lead = primary[0];
    const rest = primary.slice(1);
    return (
      <section className="space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-foreground">{title}</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Approvals first, then spending and funds.
          </p>
        </div>
        <div className="grid gap-3">
          {lead && <TaskCard task={lead} featured />}
          {rest.length > 0 && (
            <div className="grid gap-3 sm:grid-cols-2">
              {rest.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          )}
        </div>
        <SecondaryLinks tasks={secondary} />
      </section>
    );
  }

  if (layout === "fundraising") {
    return (
      <section className="space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-foreground">{title}</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Keep giving moving — gifts, then donors and campaigns.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {primary.map((task) => (
            <TaskCard key={task.id} task={task} featured={primary.length === 1} />
          ))}
        </div>
        <SecondaryLinks tasks={secondary} />
      </section>
    );
  }

  if (layout === "staff") {
    return (
      <section className="space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-foreground">{title}</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">Two actions cover most days.</p>
        </div>
        <div className="grid gap-3">
          {primary.map((task) => (
            <TaskCard key={task.id} task={task} featured />
          ))}
        </div>
        <SecondaryLinks tasks={secondary} />
      </section>
    );
  }

  if (layout === "viewer") {
    return (
      <section className="space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-foreground">{title}</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">Read-only views for your role.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {[...primary, ...secondary].map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      </section>
    );
  }

  // admin + program: balanced grid
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {layout === "program"
            ? "Reviews and program work for today."
            : "A few actions for your role — not the whole ERP."}
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {primary.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>
      <SecondaryLinks tasks={secondary} />
    </section>
  );
}

export function TaskHome() {
  const { user } = useAuth();
  const inboxQuery = useInboxCount();

  if (!user) {
    return null;
  }

  const layout = homeLayoutForRole(user.role);
  const tasks = tasksForRole(user.role);
  const checklist = checklistForRole(user.role);
  const primaryTasks = tasks.filter((task) => task.emphasis === "primary");
  const secondaryTasks = tasks.filter((task) => task.emphasis !== "primary");
  const overviewPath = getRoleOverviewPath(user.role);
  const pendingApprovals = inboxQuery.data ?? 0;
  const showApprovalsCallout =
    pendingApprovals > 0 &&
    (layout === "finance" || layout === "admin" || layout === "program");

  // Finance: put approvals first in the primary list when present
  const orderedPrimary =
    layout === "finance"
      ? [
          ...primaryTasks.filter((t) => t.id === "review-approvals"),
          ...primaryTasks.filter((t) => t.id !== "review-approvals"),
        ]
      : primaryTasks;

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <PageHeader
        title={`Hello, ${user.firstName}`}
        description={homeGreeting(user.role)}
        actions={
          <Button variant="ghost" size="sm" asChild>
            <Link href={overviewPath}>
              <LayoutDashboard className="mr-1.5 h-4 w-4" />
              Full overview
            </Link>
          </Button>
        }
      />

      {showApprovalsCallout && <ApprovalsCallout count={pendingApprovals} />}

      <TaskGrid layout={layout} primary={orderedPrimary} secondary={secondaryTasks} />

      {(layout === "admin" || layout === "fundraising") && checklist.length > 0 && (
        <Checklist items={checklist} />
      )}
    </div>
  );
}
