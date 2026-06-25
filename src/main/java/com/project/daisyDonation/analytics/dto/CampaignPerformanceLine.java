package com.project.daisyDonation.analytics.dto;

import java.math.BigDecimal;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Campaign fundraising performance summary")
public class CampaignPerformanceLine {

    @Schema(description = "Campaign ID", example = "1")
    private Long campaignId;

    @Schema(description = "Campaign name", example = "Annual Appeal")
    private String campaignName;

    @Schema(description = "Total raised from completed donations", example = "1500.00")
    private BigDecimal raisedAmount;

    @Schema(description = "Fundraising target", example = "5000.00")
    private BigDecimal targetAmount;

    @Schema(description = "Goal achievement (%)", example = "30.00", nullable = true)
    private BigDecimal goalPercent;

    @Schema(description = "Number of completed donations", example = "2")
    private long donationCount;
}
