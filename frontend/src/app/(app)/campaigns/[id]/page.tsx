"use client";

import { useQuery } from "@tanstack/react-query";
import { type ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/feedback/confirm-dialog";
import { ErrorAlert } from "@/components/feedback/error-alert";
import { LoadingState } from "@/components/feedback/loading-state";
import { CampaignStatusBadge, DonationStatusBadge, formatDonationType } from "@/components/fundraising/fundraising-status-badge";
import { PageHeader } from "@/components/layout/page-header";
import { SectionHeader } from "@/components/layout/section-header";
import { PermissionGate } from "@/components/security/permission-gate";
import { DataTable } from "@/components/tables/data-table";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { deleteCampaign, getCampaignDashboard } from "@/lib/api/campaigns";
import { formatCurrency, toNumber } from "@/lib/utils/format";
import { formatDate, formatDateTime } from "@/lib/utils/dates";
import { ApiError } from "@/types/api";
import type { DonationSummaryResponse } from "@/types/fundraising";

export default function CampaignDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { accessToken } = useAuth();
  const campaignId = Number(params.id);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const dashboardQuery = useQuery({
    queryKey: ["campaigns", campaignId, "dashboard"],
    queryFn: async () => {
      const response = await getCampaignDashboard(accessToken!, campaignId);
      return response.data;
    },
    enabled: Boolean(accessToken) && !Number.isNaN(campaignId),
  });

  const donationColumns = useMemo<ColumnDef<DonationSummaryResponse>[]>(
    () => [
      {
        accessorKey: "id",
        header: "Donation",
        cell: ({ row }) => (
          <Link href={`/donations/${row.original.id}`} className="text-primary hover:underline">
            #{row.original.id}
          </Link>
        ),
      },
      {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ row }) => formatCurrency(toNumber(row.original.amount)),
      },
      {
        accessorKey: "donationType",
        header: "Type",
        cell: ({ row }) => formatDonationType(row.original.donationType),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <DonationStatusBadge status={row.original.status} />,
      },
      {
        accessorKey: "donationTime",
        header: "Date",
        cell: ({ row }) => formatDateTime(row.original.donationTime),
      },
    ],
    [],
  );

  async function handleDelete() {
    try {
      await deleteCampaign(accessToken!, campaignId);
      toast.success("Campaign deleted");
      router.push("/campaigns");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Unable to delete campaign");
    }
  }

  if (dashboardQuery.isLoading) {
    return <LoadingState />;
  }

  if (dashboardQuery.isError || !dashboardQuery.data) {
    return <ErrorAlert message="Unable to load campaign." />;
  }

  const campaign = dashboardQuery.data;
  const progress = Math.min(100, toNumber(campaign.goalAchievementPercent));

  return (
    <div className="space-y-4">
      <PageHeader
        breadcrumbs={[
          { label: "Campaigns", href: "/campaigns" },
          { label: campaign.name },
        ]}
        title={campaign.name}
        description={campaign.description || "Fundraising campaign"}
        action={
          <div className="flex gap-2">
            <PermissionGate roles={["ORG_ADMIN", "FUNDRAISING_MANAGER", "STAFF"]}>
              <Button variant="outline" asChild>
                <Link href={`/campaigns/${campaign.id}/edit`}>Edit</Link>
              </Button>
            </PermissionGate>
            <PermissionGate roles={["ORG_ADMIN", "FUNDRAISING_MANAGER"]}>
              <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
                Delete
              </Button>
            </PermissionGate>
            <Button asChild>
              <Link href={`/donations/new?campaignId=${campaign.id}`}>Record donation</Link>
            </Button>
          </div>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <CampaignStatusBadge status={campaign.status} />
        <span className="text-sm text-muted-foreground">
          {formatDate(campaign.startDate)} – {formatDate(campaign.endDate)}
        </span>
      </div>

      <div className="rounded-md border border-border bg-surface px-4 py-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Raised</p>
            <p className="mt-0.5 text-lg font-semibold tabular-nums">{formatCurrency(toNumber(campaign.raisedAmount))}</p>
          </div>
          <div className="text-right">
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Goal</p>
            <p className="mt-0.5 text-base font-semibold tabular-nums">
              {campaign.targetAmount != null ? formatCurrency(toNumber(campaign.targetAmount)) : "—"}
            </p>
          </div>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-sm bg-muted">
          <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
        </div>
        <div className="mt-1.5 flex justify-between text-xs text-muted-foreground">
          <span>{progress.toFixed(0)}% of goal</span>
          <span>
            {campaign.donationCount} donations · {formatCurrency(toNumber(campaign.remainingAmount))} remaining
          </span>
        </div>
      </div>

      <section className="space-y-2">
        <SectionHeader title="Recent donations" description="Gifts attributed to this campaign" />
        <DataTable columns={donationColumns} data={campaign.recentDonations} />
      </section>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete campaign"
        description="This permanently removes the campaign. Existing donations will remain linked in history."
        confirmLabel="Delete"
        destructive
        onConfirm={handleDelete}
      />
    </div>
  );
}
