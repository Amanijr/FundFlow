package com.project.daisyDonation.campaign.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import com.project.daisyDonation.campaign.entity.CampaignStatus;
import com.project.daisyDonation.donation.dto.DonationSummaryResponse;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Response payload for campaign dashboard")
public class CampaignDashboardResponse {

    private Long id;
    private String name;
    private String description;
    private BigDecimal targetAmount;
    private BigDecimal raisedAmount;
    private BigDecimal remainingAmount;
    private BigDecimal goalAchievementPercent;
    private long donationCount;
    private CampaignStatus status;
    private LocalDate startDate;
    private LocalDate endDate;
    private List<DonationSummaryResponse> recentDonations;
}
