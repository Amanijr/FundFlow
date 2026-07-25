import type { JournalSourceType } from "@/types/accounting";

export function getJournalSourceLink(sourceType: JournalSourceType, sourceId: number) {
  switch (sourceType) {
    case "IN_KIND_DONATION":
      return { href: `/donations/${sourceId}`, label: `Donation #${sourceId}` };
    case "EXPENSE_PAYMENT":
      return { href: `/expenses/${sourceId}`, label: `Expense #${sourceId}` };
    case "DONATION_PAYMENT":
      return { href: null, label: `Payment #${sourceId}` };
    case "COLLECTION_PAYMENT":
      return { href: null, label: `Collection payment #${sourceId}` };
    default:
      return { href: null, label: `Source #${sourceId}` };
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
