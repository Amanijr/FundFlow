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
@Schema(description = "Projected financial figures for a future month")
public class ForecastPoint {

    @Schema(description = "Future period label (yyyy-MM)", example = "2026-09")
    private String period;

    @Schema(description = "Projected donations", example = "1800.00")
    private BigDecimal projectedDonations;

    @Schema(description = "Projected expenses", example = "450.00")
    private BigDecimal projectedExpenses;

    @Schema(description = "Projected net (donations minus expenses)", example = "1350.00")
    private BigDecimal projectedNet;
}
