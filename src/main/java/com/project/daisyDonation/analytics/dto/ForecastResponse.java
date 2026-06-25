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
@Schema(description = "Linear trend forecast for upcoming months")
public class ForecastResponse {

    @Schema(description = "Number of historical months used for the projection", example = "6")
    private int basedOnMonths;

    @Schema(description = "Number of future months projected", example = "3")
    private int forecastMonths;

    @Schema(description = "Month-by-month projections")
    private List<ForecastPoint> projections;

    @Schema(
            description = "Forecast methodology description",
            example = "Linear trend projection from the last 6 months of activity")
    private String methodology;
}
