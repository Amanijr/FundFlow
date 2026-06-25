package com.project.daisyDonation.donation.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.project.daisyDonation.donation.entity.DonationStatus;
import com.project.daisyDonation.donation.entity.DonationType;
import com.project.daisyDonation.collection.entity.CollectionType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Response payload for donation detail")
public class DonationDetailResponse {

    private Long id;
    private Long organizationId;
    private Long donorId;
    private String donorName;
    private BigDecimal amount;
    private LocalDateTime donationTime;
    private DonationStatus status;
    private DonationType donationType;
    private boolean anonymous;
    private Long campaignId;
    private String campaignName;
    private Long pledgeId;
    private Long recurringDonationId;
    private Long collectionSessionId;
    private CollectionType collectionType;
    private String source;
    private String notes;
    private String itemDescription;
    private BigDecimal estimatedValue;
}
