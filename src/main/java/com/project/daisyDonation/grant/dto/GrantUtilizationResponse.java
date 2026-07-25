package com.project.daisyDonation.grant.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.project.daisyDonation.grant.entity.GrantComplianceStatus;
import com.project.daisyDonation.grant.entity.GrantStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Response payload for grant utilization")
public class GrantUtilizationResponse {

    private Long grantId;
    private String grantName;
    private String grantCode;
    private GrantStatus status;
    private GrantComplianceStatus complianceStatus;
    private BigDecimal awardedAmount;
    private BigDecimal spentAmount;
    private BigDecimal remainingBalance;
    private BigDecimal usagePercent;
    private LocalDate endDate;
    private long daysToExpiry;
    private boolean expiringSoon;
}
