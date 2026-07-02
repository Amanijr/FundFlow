import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { CampaignStatus, DonationStatus } from "@/types/fundraising";

const donationStatusConfig: Record<
  DonationStatus,
  { label: string; variant: "secondary" | "warning" | "success" | "danger" | "outline" }
> = {
  PENDING: { label: "Pending", variant: "warning" },
  COMPLETED: { label: "Completed", variant: "success" },
  FAILED: { label: "Failed", variant: "danger" },
  CANCELLED: { label: "Cancelled", variant: "outline" },
  REFUNDED: { label: "Refunded", variant: "secondary" },
};

const campaignStatusConfig: Record<
  CampaignStatus,
  { label: string; variant: "secondary" | "warning" | "success" | "danger" | "outline" }
> = {
  DRAFT: { label: "Draft", variant: "secondary" },
  ACTIVE: { label: "Active", variant: "success" },
  COMPLETED: { label: "Completed", variant: "outline" },
  CANCELLED: { label: "Cancelled", variant: "danger" },
};

export function DonationStatusBadge({ status, className }: { status: DonationStatus; className?: string }) {
  const config = donationStatusConfig[status];
  return (
    <Badge variant={config.variant} className={cn(className)}>
      {config.label}
    </Badge>
  );
}

export function CampaignStatusBadge({ status, className }: { status: CampaignStatus; className?: string }) {
  const config = campaignStatusConfig[status];
  return (
    <Badge variant={config.variant} className={cn(className)}>
      {config.label}
    </Badge>
  );
}

export function formatDonationType(type: string) {
  return type.replaceAll("_", " ");
}
