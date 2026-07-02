import Link from "next/link";

import { formatEnumLabel } from "@/components/finance/finance-status-badge";
import { getJournalSourceLink } from "@/lib/accounting/journal-links";
import type { JournalSourceType } from "@/types/accounting";

export function JournalSourceLink({
  sourceType,
  sourceId,
}: {
  sourceType: JournalSourceType;
  sourceId: number;
}) {
  const { href, label } = getJournalSourceLink(sourceType, sourceId);
  return (
    <span>
      {formatEnumLabel(sourceType)}
      {" · "}
      {href ? (
        <Link href={href} className="text-primary hover:underline">
          {label}
        </Link>
      ) : (
        <span className="text-muted-foreground">{label}</span>
      )}
    </span>
  );
}
