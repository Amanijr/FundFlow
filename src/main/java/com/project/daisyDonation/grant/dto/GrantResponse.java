package com.project.daisyDonation.grant.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import com.project.daisyDonation.grant.entity.GrantComplianceStatus;
import com.project.daisyDonation.grant.entity.GrantRestrictionType;
import com.project.daisyDonation.grant.entity.GrantStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Response payload for grant")
public class GrantResponse {

    private Long id;
    private String name;
    private String grantCode;
    private String funderName;
    private BigDecimal awardedAmount;
    private LocalDate startDate;
    private LocalDate endDate;
    private GrantStatus status;
    private GrantRestrictionType restrictionType;
    private String restrictionNotes;
    private GrantComplianceStatus complianceStatus;
    private String complianceNotes;
    private Long programId;
    private String programName;
    private Long fundId;
    private String fundName;
    private LocalDateTime createdAt;
}
