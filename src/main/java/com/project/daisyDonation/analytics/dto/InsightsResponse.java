package com.project.daisyDonation.analytics.dto;

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
@Schema(description = "Collection of executive insights sorted by severity")
public class InsightsResponse {

    @Schema(description = "Actionable insight items")
    private List<InsightItem> insights;
}
