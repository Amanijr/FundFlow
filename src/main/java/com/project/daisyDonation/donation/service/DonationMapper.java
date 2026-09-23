package com.project.daisyDonation.donation.service;

import com.project.daisyDonation.donation.entity.Donation;
import com.project.daisyDonation.donation.dto.DonationDetailResponse;
import com.project.daisyDonation.donation.dto.DonationSummaryResponse;

public final class DonationMapper {

    private DonationMapper() {
    }

    public static DonationSummaryResponse toSummary(Donation donation) {
        return DonationSummaryResponse.builder()
                .id(donation.getId())
                .amount(donation.getAmount())
                .donationTime(donation.getDonationTime())
                .status(donation.getStatus())
                .donationType(donation.getDonationType())
                .anonymous(donation.isAnonymous())
                .campaignId(donation.getCampaign() != null ? donation.getCampaign().getId() : null)
                .campaignName(donation.getCampaign() != null ? donation.getCampaign().getName() : null)
                .build();
    }

    public static DonationDetailResponse toDetail(Donation donation) {
        return toDetail(donation, null);
    }

    public static DonationDetailResponse toDetail(Donation donation, Long paymentId) {
        String donorName = null;
        Long donorId = null;
        Long memberId = null;
        if (!donation.isAnonymous() && donation.getMember() != null) {
            memberId = donation.getMember().getId();
            donorId = memberId;
            donorName = donation.getMember().getFirstName() + " " + donation.getMember().getLastName();
        } else if (!donation.isAnonymous() && donation.getDonor() != null) {
            donorId = donation.getDonor().getId();
            donorName = donation.getDonor().getFirstName() + " " + donation.getDonor().getLastName();
        }

        return DonationDetailResponse.builder()
                .id(donation.getId())
                .organizationId(donation.getOrganization().getId())
                .donorId(donorId)
                .donorName(donorName)
                .memberId(memberId)
                .amount(donation.getAmount())
                .donationTime(donation.getDonationTime())
                .status(donation.getStatus())
                .donationType(donation.getDonationType())
                .anonymous(donation.isAnonymous())
                .campaignId(donation.getCampaign() != null ? donation.getCampaign().getId() : null)
                .campaignName(donation.getCampaign() != null ? donation.getCampaign().getName() : null)
                .fundId(donation.getFund() != null ? donation.getFund().getId() : null)
                .fundName(donation.getFund() != null ? donation.getFund().getName() : null)
                .pledgeId(donation.getPledge() != null ? donation.getPledge().getId() : null)
                .recurringDonationId(
                        donation.getRecurringDonation() != null ? donation.getRecurringDonation().getId() : null)
                .collectionSessionId(
                        donation.getCollectionSession() != null ? donation.getCollectionSession().getId() : null)
                .collectionType(donation.getCollectionSession() != null
                        ? donation.getCollectionSession().getCollectionType()
                        : null)
                .source(donation.getSource())
                .notes(donation.getNotes())
                .itemDescription(donation.getItemDescription())
                .estimatedValue(donation.getEstimatedValue())
                .paymentId(paymentId)
                .partnershipId(donation.getPartnership() != null ? donation.getPartnership().getId() : null)
                .partnershipMonth(donation.getPartnershipMonth())
                .build();
    }
}
