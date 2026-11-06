import type { PeopleModule } from "@/lib/people/module";

export function peopleCopy(module: PeopleModule) {
  return {
    module,
    noun: "donor",
    nounPlural: "donors",
    title: "Donors",
    addLabel: "Add donor",
    listDescription: "Manage donor relationships and giving history.",
    formDescription: "Primary contact for this donor.",
    emptyTitle: "No donors yet",
    emptyDescription: "Add your first donor to start tracking relationships.",
    searchPlaceholder: "Search donors...",
    giftLabel: "Record donation",
    voidLabel: "Void donation",
    voidDescription: "This removes the donation from totals and posts a reversing journal. Enter why.",
    voidedToast: "Donation voided",
    cancelledToast: "Donation cancelled",
    keepGiftLabel: "Keep donation",
    createdToast: "Donor created",
    updatedToast: "Donor updated",
    deletedToast: "Donor deleted",
    recentGiftsTitle: "Recent donations",
    recentGiftsDescription: "Latest gifts from this donor",
  };
}
