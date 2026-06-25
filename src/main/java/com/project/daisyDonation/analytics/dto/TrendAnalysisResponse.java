package com.project.daisyDonation.analytics.dto;

import java.time.LocalDate;
import java.util.List;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Donation and expense trends with source and campaign breakdowns")
public class TrendAnalysisResponse {

    @Schema(description = "Analysis period start", example = "2026-01-01")
    private LocalDate fromDate;

    @Schema(description = "Analysis period end", example = "2026-06-24")
    private LocalDate toDate;

    @Schema(description = "Time series granularity", example = "MONTHLY")
    private String granularity;

    @Schema(description = "Monthly donation totals")
    private List<TrendPoint> donationTrend;

    @Schema(description = "Monthly expense totals")
    private List<TrendPoint> expenseTrend;

    @Schema(description = "Donations grouped by source")
    private List<SourceBreakdown> donationSources;

    @Schema(description = "Campaign performance ranked by amount raised")
    private List<CampaignPerformanceLine> campaignPerformance;
}
