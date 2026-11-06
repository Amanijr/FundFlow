"use client";

import { useState } from "react";
import { Info } from "lucide-react";

import {
  CurrencyCell,
  DataErrorState,
  DateCell,
  PercentageCell,
} from "@/components/data";
import { KPIWidget } from "@/components/charts/kpi-widget";
import { MetricCard } from "@/components/charts/metric-card";
import { RecentActivityFeed } from "@/components/charts/recent-activity-feed";
import { TrendChart } from "@/components/charts/trend-chart";
import { DetailCard } from "@/components/display/detail-card";
import { EntityHeader } from "@/components/display/entity-header";
import { EmptyState } from "@/components/display/empty-state";
import { StatusBadge } from "@/components/display/status-badge";
import { ConfirmDialog } from "@/components/feedback/confirm-dialog";
import { ErrorAlert } from "@/components/feedback/error-alert";
import { SuccessAlert } from "@/components/feedback/success-alert";
import { WarningAlert } from "@/components/feedback/warning-alert";
import { CurrencyInput } from "@/components/forms/currency-input";
import { DateInput } from "@/components/forms/date-input";
import { EntitySelector } from "@/components/forms/entity-selector";
import { FileUploader } from "@/components/forms/file-uploader";
import { FormField } from "@/components/forms/form-field";
import { FormSection } from "@/components/forms/form-section";
import { PageHeader } from "@/components/layout/page-header";
import { SectionHeader } from "@/components/layout/section-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ActivityTimeline } from "@/components/workflow/activity-timeline";
import { ApprovalWorkflow } from "@/components/workflow/approval-workflow";
import { AuditTrail } from "@/components/workflow/audit-trail";
import { WorkflowStatus } from "@/components/workflow/workflow-status";
import { toast } from "@/hooks/use-toast";
import { sampleActivity, sampleAudit, sampleTrend } from "@/lib/dev/mock-data";

export default function ComponentsShowcasePage() {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [fundType, setFundType] = useState("unrestricted");
  const [reportFormat, setReportFormat] = useState("pdf");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  return (
    <div className="space-y-10 pb-10">
      <PageHeader
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Component library" }]}
        title="Component library"
        description="FundFlow shared primitives. Button & status rules follow Material 3 / Meta Horizon. See DESIGN.md."
        action={
          <Button onClick={() => toast({ title: "Action triggered", variant: "success" })}>
            Sample action
          </Button>
        }
      />

      <section className="space-y-4">
        <SectionHeader
          title="Buttons & status"
          description="Emphasis ladder: one cyan primary per row · green/red/amber = status · red filled = destructive confirm only"
        />
        <div className="rounded-[var(--radius-card)] border border-border bg-card p-4 space-y-4">
          <div>
            <p className="mb-2 text-label font-medium text-muted-foreground">
              Buttons — Meta Primary / Secondary / Borderless / Destructive · M3 filled / outlined / text
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <Button>Save (primary)</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Cancel</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link</Button>
              <Button variant="destructive">Delete</Button>
              <Button loading>Saving…</Button>
            </div>
          </div>
          <div>
            <p className="mb-2 text-label font-medium text-muted-foreground">
              Badges — soft containers (not CTAs): cyan go · green done · amber wait · red fail
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge variant="success">Completed</Badge>
              <Badge variant="warning">Pending</Badge>
              <Badge variant="danger">Failed</Badge>
              <Badge variant="info">Info</Badge>
            </div>
          </div>
          <div className="grid gap-2 md:grid-cols-2">
            <Alert variant="success">
              <Info className="h-4 w-4" />
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>Soft emerald container — outcome feedback, not a button.</AlertDescription>
            </Alert>
            <Alert variant="destructive">
              <Info className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>Soft crimson container — failure feedback.</AlertDescription>
            </Alert>
            <Alert variant="warning">
              <Info className="h-4 w-4" />
              <AlertTitle>Warning</AlertTitle>
              <AlertDescription>Soft amber container — needs attention.</AlertDescription>
            </Alert>
            <Alert variant="info">
              <Info className="h-4 w-4" />
              <AlertTitle>Info</AlertTitle>
              <AlertDescription>Soft cyan wash — neutral guidance.</AlertDescription>
            </Alert>
          </div>
          <p className="text-supporting text-muted-foreground">
            Dialog pattern: outline Cancel + one primary Confirm; for Delete/Void use outline trigger then
            destructive confirm. Full dictionary in repo root DESIGN.md.
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <SectionHeader title="UI primitives" description="Adopted from Phase 05 component library" />
        <div className="grid gap-4 md:grid-cols-2">
          <FormField label="Fund type" htmlFor="demo-fund-type">
            <Select value={fundType} onValueChange={setFundType}>
              <SelectTrigger id="demo-fund-type">
                <SelectValue placeholder="Select fund type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unrestricted">Unrestricted</SelectItem>
                <SelectItem value="restricted">Restricted</SelectItem>
                <SelectItem value="endowment">Endowment</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Notes" htmlFor="demo-notes">
            <Textarea id="demo-notes" placeholder="Internal notes…" rows={3} />
          </FormField>
        </div>
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="rounded-md border border-border p-4 text-sm">
            Tab panel content for overview metrics.
          </TabsContent>
          <TabsContent value="activity" className="rounded-md border border-border p-4 text-sm">
            Tab panel content for recent activity.
          </TabsContent>
          <TabsContent value="settings" className="rounded-md border border-border p-4 text-sm">
            Tab panel content for module settings.
          </TabsContent>
        </Tabs>
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-2">
            <Switch
              id="demo-notifications"
              checked={notificationsEnabled}
              onCheckedChange={setNotificationsEnabled}
            />
            <Label htmlFor="demo-notifications">Email notifications</Label>
          </div>
          <RadioGroup value={reportFormat} onValueChange={setReportFormat} className="flex gap-4">
            <div className="flex items-center gap-2">
              <RadioGroupItem value="pdf" id="format-pdf" />
              <Label htmlFor="format-pdf">PDF</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="csv" id="format-csv" />
              <Label htmlFor="format-csv">CSV</Label>
            </div>
          </RadioGroup>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" aria-label="More information">
                <Info className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Tooltip on icon button</TooltipContent>
          </Tooltip>
          <Spinner size="sm" />
        </div>
        <div className="space-y-2">
          <Label>Budget utilization</Label>
          <Progress value={68} />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-48" />
        </div>
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Info</AlertTitle>
          <AlertDescription>Default alert using the ui/alert primitive.</AlertDescription>
        </Alert>
      </section>

      <section className="space-y-4">
        <SectionHeader title="Data experience" description="Phase 06 table, filters, and cells" />
        <div className="grid gap-3 md:grid-cols-4">
          <div className="rounded-md border border-border p-3">
            <p className="text-xs text-muted-foreground">Currency</p>
            <CurrencyCell value={12500} className="text-lg font-semibold" />
          </div>
          <div className="rounded-md border border-border p-3">
            <p className="text-xs text-muted-foreground">Percent</p>
            <PercentageCell value={23.4} />
          </div>
          <div className="rounded-md border border-border p-3">
            <p className="text-xs text-muted-foreground">Date</p>
            <DateCell value="2026-06-30" />
          </div>
          <div className="rounded-md border border-border p-3 text-sm">
            <p className="text-xs text-muted-foreground">Live table</p>
            <p className="mt-1">Open <strong>/donors</strong> for DataTable demo.</p>
          </div>
        </div>
        <DataErrorState title="Sample error" description="Retry loads data again." onRetry={() => toast({ title: "Retried", variant: "info" })} />
      </section>

      <section className="space-y-4">
        <SectionHeader title="Feedback" description="Alerts, dialogs, and toasts" />
        <div className="grid gap-3">
          <SuccessAlert message="Record saved successfully." />
          <WarningAlert message="This budget is nearing its limit." />
          <ErrorAlert message="Unable to connect to the API." />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => toast({ title: "Saved", variant: "success" })}>
            Toast success
          </Button>
          <Button variant="outline" onClick={() => toast({ title: "Warning", variant: "warning" })}>
            Toast warning
          </Button>
          <Button variant="outline" onClick={() => toast({ title: "Error", variant: "destructive" })}>
            Toast error
          </Button>
        </div>
        <Button variant="outline" onClick={() => setConfirmOpen(true)}>
          Open delete confirm
        </Button>
        <ConfirmDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          title="Delete record?"
          description="This action cannot be undone."
          confirmLabel="Delete"
          destructive
          onConfirm={() => toast({ title: "Deleted", variant: "default" })}
        />
      </section>

      <section className="space-y-4">
        <SectionHeader title="Status & entity" />
        <div className="flex flex-wrap gap-2">
          {(["DRAFT", "PENDING_REVIEW", "APPROVED", "REJECTED", "COMPLETED", "ARCHIVED"] as const).map((status) => (
            <StatusBadge key={status} status={status} />
          ))}
        </div>
        <EntityHeader
          title="Hope Foundation"
          status="APPROVED"
          metadata={<span>Donor since 2022 · Major donor</span>}
          actions={<Button size="sm">Edit</Button>}
        />
        <DetailCard
          title="Contact"
          fields={[
            { label: "Email", value: "contact@hope.org" },
            { label: "Phone", value: "+1 555 0100" },
          ]}
        />
        <EmptyState title="No campaigns yet" description="Create your first fundraising campaign." actionLabel="Create campaign" onAction={() => undefined} />
      </section>

      <section className="space-y-4">
        <SectionHeader title="Forms" />
        <FormSection title="Sample fields" description="Reusable form building blocks">
          <FormField label="Name" htmlFor="demo-name">
            <Input id="demo-name" placeholder="Jane Donor" />
          </FormField>
          <FormField label="Amount" htmlFor="demo-amount">
            <CurrencyInput id="demo-amount" />
          </FormField>
          <FormField label="Gift date" htmlFor="demo-date" className="sm:col-span-2">
            <DateInput id="demo-date" />
          </FormField>
          <FormField label="Donor" className="sm:col-span-2">
            <EntitySelector
              options={[
                { id: "1", label: "Jane Donor", description: "jane@example.org" },
                { id: "2", label: "John Smith", description: "john@example.org" },
              ]}
            />
          </FormField>
        </FormSection>
        <FileUploader onFilesSelected={() => undefined} />
      </section>

      <section className="space-y-4">
        <SectionHeader title="Workflow" />
        <WorkflowStatus current="PENDING_REVIEW" />
        <ActivityTimeline events={sampleActivity} />
        <AuditTrail records={sampleAudit} />
        <ApprovalWorkflow onApprove={() => toast({ title: "Approved", variant: "success" })} />
      </section>

      <section className="space-y-4">
        <SectionHeader title="Dashboard widgets" />
        <div className="grid gap-4 md:grid-cols-3">
          <KPIWidget label="Total donations" value="$19,000" changePercent={12} />
          <MetricCard label="Pending approvals" value="4" variant="warning" />
          <MetricCard label="Overdue expenses" value="0" variant="success" />
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <TrendChart title="Donation trend" data={sampleTrend} />
          <RecentActivityFeed
            items={sampleActivity.map((event) => ({
              id: event.id,
              title: event.title,
              subtitle: event.description,
              timestamp: event.timestamp,
            }))}
          />
        </div>
      </section>
    </div>
  );
}
