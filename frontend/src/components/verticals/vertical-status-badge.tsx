import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type {
  BeneficiaryStatus,
  GrantStatus,
  ProgramStatus,
  SponsorshipStatus,
} from "@/types/verticals";

function badge(label: string, variant: "secondary" | "success" | "warning" | "danger" | "outline") {
  return (
    <Badge variant={variant} className={cn()}>
      {label}
    </Badge>
  );
}

const programLabels: Record<ProgramStatus, string> = {
  PLANNED: "Planned",
  ACTIVE: "Active",
  COMPLETED: "Completed",
  ON_HOLD: "On hold",
};

const grantLabels: Record<GrantStatus, string> = {
  DRAFT: "Draft",
  ACTIVE: "Active",
  CLOSED: "Closed",
  EXPIRED: "Expired",
};

const beneficiaryLabels: Record<BeneficiaryStatus, string> = {
  ACTIVE: "Active",
  INACTIVE: "Inactive",
  GRADUATED: "Graduated",
  WITHDRAWN: "Withdrawn",
};

const sponsorshipLabels: Record<SponsorshipStatus, string> = {
  ACTIVE: "Active",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export function ProgramStatusBadge({ status }: { status: ProgramStatus }) {
  const variant =
    status === "ACTIVE" ? "success" : status === "ON_HOLD" ? "warning" : status === "COMPLETED" ? "outline" : "secondary";
  return badge(programLabels[status], variant);
}

export function GrantStatusBadge({ status }: { status: GrantStatus }) {
  const variant =
    status === "ACTIVE" ? "success" : status === "EXPIRED" ? "danger" : status === "CLOSED" ? "outline" : "secondary";
  return badge(grantLabels[status], variant);
}

export function BeneficiaryStatusBadge({ status }: { status: BeneficiaryStatus }) {
  const variant =
    status === "ACTIVE" ? "success" : status === "GRADUATED" ? "outline" : status === "WITHDRAWN" ? "danger" : "secondary";
  return badge(beneficiaryLabels[status], variant);
}

export function SponsorshipStatusBadge({ status }: { status: SponsorshipStatus }) {
  const variant = status === "ACTIVE" ? "success" : status === "CANCELLED" ? "danger" : "outline";
  return badge(sponsorshipLabels[status], variant);
}
