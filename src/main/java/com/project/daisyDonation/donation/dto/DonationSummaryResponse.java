package com.project.daisyDonation.donation.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.project.daisyDonation.donation.entity.DonationStatus;
import com.project.daisyDonation.donation.entity.DonationType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Response payload for donation summary")
public class DonationSummaryResponse {

    private Long id;
    private BigDecimal amount;
    private LocalDateTime donationTime;
    private DonationStatus status;
    private DonationType donationType;
    private boolean anonymous;
    private Long campaignId;
    private String campaignName;
}
