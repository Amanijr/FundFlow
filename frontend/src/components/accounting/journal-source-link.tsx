import Link from "next/link";

import { getJournalSourceLink, journalSourceLabel } from "@/lib/accounting/journal-links";
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
      {journalSourceLabel(sourceType)}
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
