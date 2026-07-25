package com.project.daisyDonation.program.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Response payload for program dashboard")
public class ProgramDashboardResponse {

    private Long programId;
    private String programName;
    private String programCode;
    private long grantCount;
    private long activeGrantCount;
    private BigDecimal totalAwarded;
    private BigDecimal totalSpent;
    private BigDecimal remainingBalance;
    private Long activeBudgetId;
    private String activeBudgetName;
    private BigDecimal activeBudgetAmount;
}
