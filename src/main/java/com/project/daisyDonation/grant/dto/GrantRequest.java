package com.project.daisyDonation.grant.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.project.daisyDonation.grant.entity.GrantRestrictionType;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Request payload for grant")
public class GrantRequest {
    @Schema(description = "name")
    @NotBlank
    @Size(max = 255)
    private String name;
    @Schema(description = "grant code")
    @NotBlank
    @Size(max = 50)
    private String grantCode;
    @Schema(description = "funder name")
    @NotBlank
    @Size(max = 255)
    private String funderName;
    @Schema(description = "awarded amount")
    @NotNull
    @DecimalMin(value = "0.01", message = "Awarded amount must be greater than zero")
    private BigDecimal awardedAmount;
    @Schema(description = "start date")
    @NotNull
    private LocalDate startDate;
    @Schema(description = "end date")
    @NotNull
    private LocalDate endDate;
    @Schema(description = "restriction type")
    @NotNull
    private GrantRestrictionType restrictionType;
    @Schema(description = "restriction notes")
    @Size(max = 2000)
    private String restrictionNotes;
    @Schema(description = "program id")
    private Long programId;
    @Schema(description = "fund id")
    private Long fundId;
}
