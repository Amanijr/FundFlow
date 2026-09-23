import type { OrganizationType } from "@/types/api";

import { peopleModuleForOrganization, type PeopleModule } from "@/lib/people/module";

export function peopleCopy(module: PeopleModule) {
  const church = module === "members";
  return {
    module,
    church,
    noun: church ? "member" : "donor",
    nounPlural: church ? "members" : "donors",
    title: church ? "Members" : "Donors",
    addLabel: church ? "Add member" : "Add donor",
    listDescription: church
      ? "People who belong to the church — contact details are optional."
      : "Manage donor relationships and giving history.",
    formDescription: church
      ? "Name is enough. Phone and email help later for receipts."
      : "Primary contact for this donor.",
    emptyTitle: church ? "No members yet" : "No donors yet",
    emptyDescription: church
      ? "Add someone from the congregation to start membership and giving."
      : "Add your first donor to start tracking relationships.",
    searchPlaceholder: church ? "Search members or member number..." : "Search donors...",
    giftLabel: church ? "Record gift" : "Record donation",
    voidLabel: church ? "Void gift" : "Void donation",
    voidDescription: church
      ? "This removes the gift from giving totals and posts a reversing journal. Enter why."
      : "This removes the donation from totals and posts a reversing journal. Enter why.",
    voidedToast: church ? "Gift voided" : "Donation voided",
    cancelledToast: church ? "Gift cancelled" : "Donation cancelled",
    keepGiftLabel: church ? "Keep gift" : "Keep donation",
    createdToast: church ? "Member saved" : "Donor created",
    updatedToast: church ? "Member updated" : "Donor updated",
    deletedToast: church ? "Member removed" : "Donor deleted",
    recentGiftsTitle: church ? "Recent gifts" : "Recent donations",
    recentGiftsDescription: church ? "Latest gifts from this member" : "Latest gifts from this donor",
  };
}

export function peopleCopyForOrganization(organizationType?: OrganizationType | null) {
  return peopleCopy(peopleModuleForOrganization(organizationType));
}
