import type { JournalSourceType } from "@/types/accounting";

export function journalSourceLabel(sourceType: JournalSourceType) {
  switch (sourceType) {
    case "DONATION_PAYMENT":
      return "Gift received";
    case "COLLECTION_PAYMENT":
      return "Collection";
    case "IN_KIND_DONATION":
      return "In-kind gift";
    case "EXPENSE_PAYMENT":
      return "Expense paid";
    default:
      return "Books entry";
  }
}

export function journalPostingSummary(
  entry: {
    lines?: { accountName: string; debitAmount: number | string; creditAmount: number | string }[];
  },
) {
  const lines = entry.lines ?? [];
  const received = lines.filter((line) => Number(line.debitAmount) > 0).map((line) => line.accountName);
  const recorded = lines.filter((line) => Number(line.creditAmount) > 0).map((line) => line.accountName);
  if (received.length && recorded.length) {
    return `${received.join(", ")} → ${recorded.join(", ")}`;
  }
  return [...received, ...recorded].join(", ") || null;
}

export function getJournalSourceLink(sourceType: JournalSourceType, sourceId: number) {
  switch (sourceType) {
    case "IN_KIND_DONATION":
      return { href: `/donations/${sourceId}`, label: "Open gift" };
    case "EXPENSE_PAYMENT":
      return { href: `/expenses/${sourceId}`, label: "Open expense" };
    case "DONATION_PAYMENT":
      return { href: null, label: "Payment recorded" };
    case "COLLECTION_PAYMENT":
      return { href: null, label: "Collection recorded" };
    default:
      return { href: null, label: "Recorded" };
  }
}

export function findJournalEntriesForDonation(
  entries: { id: number; sourceType: JournalSourceType; sourceId: number }[],
  donationId: number,
) {
  return entries.filter(
    (entry) => entry.sourceType === "IN_KIND_DONATION" && entry.sourceId === donationId,
  );
}

export function findJournalEntriesForExpense(
  entries: { id: number; sourceType: JournalSourceType; sourceId: number }[],
  expenseId: number,
) {
  return entries.filter(
    (entry) => entry.sourceType === "EXPENSE_PAYMENT" && entry.sourceId === expenseId,
  );
}
