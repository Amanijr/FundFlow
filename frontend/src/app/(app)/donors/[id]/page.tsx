"use client";

import { useQuery } from "@tanstack/react-query";
import { type ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { DetailCard } from "@/components/display/detail-card";
import { ConfirmDialog } from "@/components/feedback/confirm-dialog";
import { ErrorAlert } from "@/components/feedback/error-alert";
import { LoadingState } from "@/components/feedback/loading-state";
import { DonationStatusBadge, formatDonationType } from "@/components/fundraising/fundraising-status-badge";
import { PageHeader } from "@/components/layout/page-header";
import { SectionHeader } from "@/components/layout/section-header";
import { PermissionGate } from "@/components/security/permission-gate";
import { DataTable } from "@/components/tables/data-table";
import { ActivityTimeline } from "@/components/workflow/activity-timeline";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { deleteDonor, getDonor } from "@/lib/api/donors";
import { formatCurrency, toNumber } from "@/lib/utils/format";
import { formatDate, formatDateTime } from "@/lib/utils/dates";
import { ApiError } from "@/types/api";
import type { DonationSummaryResponse } from "@/types/fundraising";

export default function DonorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { accessToken } = useAuth();
  const donorId = Number(params.id);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const donorQuery = useQuery({
    queryKey: ["donors", donorId],
    queryFn: async () => {
      const response = await getDonor(accessToken!, donorId);
      return response.data;
    },
    enabled: Boolean(accessToken) && !Number.isNaN(donorId),
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

  const activityEvents = useMemo(() => {
    const donations = donorQuery.data?.recentDonations ?? [];
    return donations.map((donation) => ({
      id: String(donation.id),
      title: `${formatCurrency(toNumber(donation.amount))} ${formatDonationType(donation.donationType).toLowerCase()} gift`,
      description: donation.campaignName ? `Campaign: ${donation.campaignName}` : undefined,
      timestamp: donation.donationTime,
    }));
  }, [donorQuery.data?.recentDonations]);

  async function handleDelete() {
    try {
      await deleteDonor(accessToken!, donorId);
      toast.success("Donor deleted");
      router.push("/donors");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Unable to delete donor");
    }
  }

  if (donorQuery.isLoading) {
    return <LoadingState />;
  }

  if (donorQuery.isError || !donorQuery.data) {
    return <ErrorAlert message="Unable to load donor." />;
  }

  const donor = donorQuery.data;

  return (
    <div className="space-y-4">
      <PageHeader
        breadcrumbs={[
          { label: "Donors", href: "/donors" },
          { label: `${donor.firstName} ${donor.lastName}` },
        ]}
        title={`${donor.firstName} ${donor.lastName}`}
        description={donor.email}
        action={
          <div className="flex gap-2">
            <PermissionGate roles={["ORG_ADMIN", "FUNDRAISING_MANAGER", "FINANCE_MANAGER", "STAFF"]}>
              <Button variant="outline" asChild>
                <Link href={`/donors/${donor.id}/edit`}>Edit</Link>
              </Button>
            </PermissionGate>
            <PermissionGate roles={["ORG_ADMIN", "FUNDRAISING_MANAGER"]}>
              <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
                Delete
              </Button>
            </PermissionGate>
            <Button asChild>
              <Link href={`/donations/new?donorId=${donor.id}`}>Record donation</Link>
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <DetailCard
          title="Giving summary"
          fields={[
            { label: "Lifetime value", value: formatCurrency(toNumber(donor.lifetimeValue)) },
            { label: "Donations", value: String(donor.donationCount) },
            { label: "Member since", value: formatDate(donor.createdAt) },
          ]}
        />
        <DetailCard
          title="Contact"
          fields={[
            { label: "Email", value: donor.email },
            { label: "Phone", value: donor.phone },
            { label: "Address", value: [donor.address, donor.city, donor.state, donor.country].filter(Boolean).join(", ") || "—" },
          ]}
          className="md:col-span-2"
        />
      </div>

      <section className="space-y-4">
        <SectionHeader title="Recent donations" description="Latest gifts from this donor" />
        <DataTable columns={donationColumns} data={donor.recentDonations} />
      </section>

      <section className="space-y-4">
        <SectionHeader title="Activity" description="Chronological giving history" />
        <ActivityTimeline events={activityEvents} />
      </section>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete donor"
        description="This permanently removes the donor record. Donations already recorded will remain."
        confirmLabel="Delete"
        destructive
        onConfirm={handleDelete}
      />
    </div>
  );
}
