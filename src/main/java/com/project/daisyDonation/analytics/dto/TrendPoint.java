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
@Schema(description = "Single point in a monthly time series")
public class TrendPoint {

    @Schema(description = "Period label (yyyy-MM)", example = "2026-06")
    private String period;

    @Schema(description = "Total amount for the period", example = "1500.00")
    private BigDecimal amount;

    @Schema(description = "Transaction count in the period", example = "3")
    private long count;
}
