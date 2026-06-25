package com.project.daisyDonation.analytics.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Rule-based executive insight or alert")
public class InsightItem {

    @Schema(description = "Insight domain", example = "FUNDRAISING")
    private String category;

    @Schema(description = "Priority level")
    private InsightSeverity severity;

    @Schema(description = "Short headline", example = "Strong donation growth")
    private String title;

    @Schema(
            description = "Detailed recommendation or observation",
            example = "Donations grew 18.50% compared to the prior month.")
    private String message;
}
