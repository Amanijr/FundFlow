"use client";

import { useQuery } from "@tanstack/react-query";
import { type ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { MemberMinistriesPanel } from "@/components/church/member-ministries-panel";
import { MemberPartnershipsPanel } from "@/components/church/member-partnerships-panel";
import { ChurchNav } from "@/components/church/church-nav";
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
import { deletePerson, getPerson } from "@/lib/api/donors";
import { peopleCopy } from "@/lib/people/copy";
import { peopleListPath, personEditPath, personPath, type PeopleModule } from "@/lib/people/module";
import { formatCurrency, toNumber } from "@/lib/utils/format";
import { formatDate, formatDateTime } from "@/lib/utils/dates";
import { ApiError } from "@/types/api";
import type { DonationSummaryResponse } from "@/types/fundraising";

export function PeopleDetailPage({ module }: { module: PeopleModule }) {
  const params = useParams();
  const router = useRouter();
  const { accessToken } = useAuth();
  const copy = peopleCopy(module);
  const personId = Number(params.id);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const personQuery = useQuery({
    queryKey: ["people", module, personId],
    queryFn: async () => {
      const response = await getPerson(accessToken!, module, personId);
      return response.data;
    },
    enabled: Boolean(accessToken) && !Number.isNaN(personId),
  });

  const donationColumns = useMemo<ColumnDef<DonationSummaryResponse>[]>(
    () => [
      {
        accessorKey: "id",
        header: copy.church ? "Gift" : "Donation",
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
    [copy.church],
  );

  const activityEvents = useMemo(() => {
    const donations = personQuery.data?.recentDonations ?? [];
    return donations.map((donation) => ({
      id: String(donation.id),
      title: `${formatCurrency(toNumber(donation.amount))} ${formatDonationType(donation.donationType).toLowerCase()} gift`,
      description: donation.campaignName ? `Campaign: ${donation.campaignName}` : undefined,
      timestamp: donation.donationTime,
    }));
  }, [personQuery.data?.recentDonations]);

  async function handleDelete() {
    try {
      await deletePerson(accessToken!, module, personId);
      toast.success(copy.deletedToast);
      router.push(peopleListPath(module));
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : `Unable to delete ${copy.noun}`);
    }
  }

  if (personQuery.isLoading) {
    return <LoadingState />;
  }

  if (personQuery.isError || !personQuery.data) {
    return <ErrorAlert message={`Unable to load ${copy.noun}.`} />;
  }

  const person = personQuery.data;

  return (
    <div className="space-y-4">
      {module === "members" ? <ChurchNav /> : null}
      <PageHeader
        breadcrumbs={[
          { label: copy.title, href: peopleListPath(module) },
          { label: `${person.firstName} ${person.lastName}` },
        ]}
        title={`${person.firstName} ${person.lastName}`}
        description={
          module === "members" && person.memberNumber
            ? `Member ${person.memberNumber}${person.email ? ` · ${person.email}` : ""}`
            : (person.email ?? copy.title)
        }
        action={
          <div className="flex gap-2">
            <PermissionGate roles={["ORG_ADMIN", "FUNDRAISING_MANAGER", "FINANCE_MANAGER", "STAFF"]}>
              <Button variant="outline" asChild>
                <Link href={personEditPath(module, person.id)}>Edit</Link>
              </Button>
            </PermissionGate>
            <PermissionGate roles={["ORG_ADMIN", "FUNDRAISING_MANAGER"]}>
              <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
                Delete
              </Button>
            </PermissionGate>
            <Button asChild>
              <Link href={`/donations/new?donorId=${person.id}`}>{copy.giftLabel}</Link>
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <DetailCard
          title="Giving summary"
          fields={[
            { label: "Lifetime value", value: formatCurrency(toNumber(person.lifetimeValue)) },
            { label: copy.church ? "Gifts" : "Donations", value: String(person.donationCount) },
            { label: copy.church ? "Member since" : "Added", value: formatDate(person.createdAt) },
          ]}
        />
        <DetailCard
          title="Contact"
          fields={[
            ...(module === "members"
              ? [{ label: "Member number", value: person.memberNumber ?? "—" }]
              : []),
            { label: "Status", value: person.membershipStatus ?? "ACTIVE" },
            { label: "Email", value: person.email || "—" },
            { label: "Phone", value: person.phone || "—" },
            {
              label: "Address",
              value: [person.address, person.city, person.state, person.country].filter(Boolean).join(", ") || "—",
            },
          ]}
          className="md:col-span-2"
        />
      </div>

      {module === "members" && accessToken ? (
        <>
          <MemberPartnershipsPanel memberId={person.id} accessToken={accessToken} />
          <MemberMinistriesPanel memberId={person.id} accessToken={accessToken} />
        </>
      ) : null}

      <section className="space-y-4">
        <SectionHeader title={copy.recentGiftsTitle} description={copy.recentGiftsDescription} />
        <DataTable columns={donationColumns} data={person.recentDonations} />
      </section>

      <section className="space-y-4">
        <SectionHeader title="Activity" description="Chronological giving history" />
        <ActivityTimeline events={activityEvents} />
      </section>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={`Delete ${copy.noun}`}
        description={`This removes the ${copy.noun} record. Gifts already recorded will remain.`}
        confirmLabel="Delete"
        destructive
        onConfirm={handleDelete}
      />
    </div>
  );
}
