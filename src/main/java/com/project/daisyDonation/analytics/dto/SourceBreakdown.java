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
@Schema(description = "Donation amount grouped by source or donation type")
public class SourceBreakdown {

    @Schema(description = "Source channel or donation type", example = "ONLINE")
    private String source;

    @Schema(description = "Total donated via this source", example = "1500.00")
    private BigDecimal amount;

    @Schema(description = "Number of donations", example = "2")
    private long count;

    @Schema(description = "Share of total donations (%)", example = "75.00")
    private BigDecimal sharePercent;
}
