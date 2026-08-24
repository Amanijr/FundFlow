import { Badge } from "@/components/ui/badge";
import { collectionStatusLabel } from "@/lib/church/labels";
import type { CollectionSessionStatus } from "@/types/collection";

const variants: Record<CollectionSessionStatus, "secondary" | "warning" | "success" | "outline"> = {
  DRAFT: "secondary",
  COUNTED: "warning",
  VERIFIED: "success",
  DEPOSITED: "outline",
};

export function CollectionStatusBadge({ status }: { status: CollectionSessionStatus }) {
  return <Badge variant={variants[status]}>{collectionStatusLabel(status)}</Badge>;
}
