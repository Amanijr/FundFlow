import type { JournalSourceType } from "@/types/accounting";

export function journalSourceLabel(sourceType: JournalSourceType) {
  switch (sourceType) {
    case "DONATION_PAYMENT":
      return "Gift received";
    case "DONATION_VOID":
      return "Gift voided";
    case "COLLECTION_PAYMENT":
      return "Collection";
    case "COLLECTION_VOID":
      return "Collection voided";
    case "IN_KIND_DONATION":
      return "In-kind gift";
    case "IN_KIND_VOID":
      return "In-kind voided";
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
    case "IN_KIND_VOID":
      return { href: `/donations/${sourceId}`, label: "Open gift" };
    case "EXPENSE_PAYMENT":
      return { href: `/expenses/${sourceId}`, label: "Open expense" };
    case "DONATION_PAYMENT":
      return { href: null, label: "Payment recorded" };
    case "DONATION_VOID":
      return { href: null, label: "Gift voided" };
    case "COLLECTION_PAYMENT":
      return { href: null, label: "Collection recorded" };
    case "COLLECTION_VOID":
      return { href: null, label: "Collection voided" };
    default:
      return { href: null, label: "Recorded" };
  }
}

export function findJournalEntriesForDonation<
  T extends { sourceType: JournalSourceType; sourceId: number },
>(entries: T[], donationId: number, paymentId?: number) {
  return entries.filter((entry) => {
    if (
      (entry.sourceType === "IN_KIND_DONATION" || entry.sourceType === "IN_KIND_VOID") &&
      entry.sourceId === donationId
    ) {
      return true;
    }
    if (
      paymentId &&
      (entry.sourceType === "DONATION_PAYMENT" ||
        entry.sourceType === "DONATION_VOID" ||
        entry.sourceType === "COLLECTION_PAYMENT" ||
        entry.sourceType === "COLLECTION_VOID") &&
      entry.sourceId === paymentId
    ) {
      return true;
    }
    return false;
  });
}

export function findJournalEntriesForExpense<
  T extends { sourceType: JournalSourceType; sourceId: number },
>(entries: T[], expenseId: number) {
  return entries.filter(
    (entry) => entry.sourceType === "EXPENSE_PAYMENT" && entry.sourceId === expenseId,
  );
}
