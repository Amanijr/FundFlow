"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { AttachmentList } from "@/components/documents/attachment-list";
import { DetailCard } from "@/components/display/detail-card";
import { ErrorAlert } from "@/components/feedback/error-alert";
import { LoadingState } from "@/components/feedback/loading-state";
import { DonationStatusBadge, formatDonationType } from "@/components/fundraising/fundraising-status-badge";
import { PageHeader } from "@/components/layout/page-header";
import { SectionHeader } from "@/components/layout/section-header";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/use-auth";
import { listJournalEntries } from "@/lib/api/accounting";
import { findJournalEntriesForDonation } from "@/lib/accounting/journal-links";
import { getDonation, previewReceipt } from "@/lib/api/donations";
import { formatCurrency, toNumber } from "@/lib/utils/format";
import { formatDateTime } from "@/lib/utils/dates";
import { ApiError } from "@/types/api";
import type { ReceiptResponse } from "@/types/fundraising";

export default function DonationDetailPage() {
  const params = useParams();
  const { accessToken } = useAuth();
  const donationId = Number(params.id);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [receipt, setReceipt] = useState<ReceiptResponse | null>(null);
  const [receiptLoading, setReceiptLoading] = useState(false);

  const donationQuery = useQuery({
    queryKey: ["donations", donationId],
    queryFn: async () => {
      const response = await getDonation(accessToken!, donationId);
      return response.data;
    },
    enabled: Boolean(accessToken) && !Number.isNaN(donationId),
  });

  const journalQuery = useQuery({
    queryKey: ["accounting", "journal-entries"],
    queryFn: async () => (await listJournalEntries(accessToken!)).data,
    enabled: Boolean(accessToken),
  });

  const linkedJournalEntries = useMemo(
    () => findJournalEntriesForDonation(journalQuery.data ?? [], donationId),
    [journalQuery.data, donationId],
  );

  async function handlePreviewReceipt() {
    setReceiptLoading(true);
    try {
      const response = await previewReceipt(accessToken!, donationId);
      setReceipt(response.data);
      setReceiptOpen(true);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Unable to load receipt");
    } finally {
      setReceiptLoading(false);
    }
  }

  if (donationQuery.isLoading) {
    return <LoadingState />;
  }

  if (donationQuery.isError || !donationQuery.data) {
    return <ErrorAlert message="Unable to load donation." />;
  }

  const donation = donationQuery.data;

  return (
    <div className="space-y-4">
      <PageHeader
        breadcrumbs={[
          { label: "Donations", href: "/donations" },
          { label: `Donation #${donation.id}` },
        ]}
        title={`Donation #${donation.id}`}
        description={formatDateTime(donation.donationTime)}
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={handlePreviewReceipt} disabled={receiptLoading}>
              View receipt
            </Button>
          </div>
        }
      />

      <div className="flex items-center gap-3">
        <DonationStatusBadge status={donation.status} />
        <span className="text-sm text-muted-foreground">{formatDonationType(donation.donationType)}</span>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <DetailCard
          title="Gift details"
          fields={[
            { label: "Amount", value: formatCurrency(toNumber(donation.amount)) },
            { label: "Anonymous", value: donation.anonymous ? "Yes" : "No" },
            { label: "Source", value: donation.source ?? "—" },
            { label: "Notes", value: donation.notes ?? "—" },
          ]}
        />
        <DetailCard
          title="Relationships"
          fields={[
            {
              label: "Donor",
              value: donation.donorId ? (
                <Link href={`/donors/${donation.donorId}`} className="text-primary hover:underline">
                  {donation.donorName ?? `Donor #${donation.donorId}`}
                </Link>
              ) : (
                "Anonymous"
              ),
            },
            {
              label: "Campaign",
              value: donation.campaignId ? (
                <Link href={`/campaigns/${donation.campaignId}`} className="text-primary hover:underline">
                  {donation.campaignName ?? `Campaign #${donation.campaignId}`}
                </Link>
              ) : (
                "—"
              ),
            },
            { label: "Item description", value: donation.itemDescription ?? "—" },
            {
              label: "Estimated value",
              value:
                donation.estimatedValue != null ? formatCurrency(toNumber(donation.estimatedValue)) : "—",
            },
          ]}
        />
      </div>

      <DetailCard
        title="Accounting"
        fields={[
          {
            label: "Journal entries",
            value:
              linkedJournalEntries.length > 0 ? (
                <span className="flex flex-col gap-1">
                  {linkedJournalEntries.map((entry) => (
                    <Link
                      key={entry.id}
                      href={`/accounting/journal-entries/${entry.id}`}
                      className="text-primary hover:underline"
                    >
                      Journal entry #{entry.id}
                    </Link>
                  ))}
                </span>
              ) : (
                <span className="text-muted-foreground">
                  No linked journal entry yet.{" "}
                  <Link href="/accounting/journal-entries" className="text-primary hover:underline">
                    Browse journal entries
                  </Link>
                </span>
              ),
          },
        ]}
      />

      <section className="space-y-4">
        <SectionHeader title="Attachments" description="Receipt scans and correspondence" />
        <AttachmentList entityType="donation" entityId={donationId} category="receipt" />
      </section>

      <Dialog open={receiptOpen} onOpenChange={setReceiptOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{receipt?.subject ?? "Donation receipt"}</DialogTitle>
          </DialogHeader>
          {receipt && (
            <div className="space-y-4 text-sm">
              <p className="text-muted-foreground">
                {receipt.organizationName} · Receipt {receipt.receiptNumber}
              </p>
              <pre className="whitespace-pre-wrap rounded-md bg-muted p-4 text-foreground">{receipt.body}</pre>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
