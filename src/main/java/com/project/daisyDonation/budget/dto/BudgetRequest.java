package com.project.daisyDonation.budget.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDate;

import com.project.daisyDonation.budget.entity.BudgetScopeType;

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
@Schema(description = "Request payload for budget")
public class BudgetRequest {
    @Schema(description = "name")
    @NotBlank
    @Size(max = 255)
    private String name;
    @Schema(description = "fiscal year")
    @NotNull
    private Integer fiscalYear;
    @Schema(description = "start date")
    @NotNull
    private LocalDate startDate;
    @Schema(description = "end date")
    @NotNull
    private LocalDate endDate;
    @Schema(description = "scope type")
    @NotNull
    private BudgetScopeType scopeType;
    @Schema(description = "department")
    @Size(max = 100)
    private String department;
    @Schema(description = "fund id")
    private Long fundId;
    @Schema(description = "campaign id")
    private Long campaignId;
    @Schema(description = "program id")
    private Long programId;
}
