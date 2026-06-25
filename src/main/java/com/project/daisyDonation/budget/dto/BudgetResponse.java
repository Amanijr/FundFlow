package com.project.daisyDonation.budget.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import com.project.daisyDonation.budget.entity.BudgetScopeType;
import com.project.daisyDonation.budget.entity.BudgetStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Response payload for budget")
public class BudgetResponse {

    private Long id;
    private String name;
    private int fiscalYear;
    private LocalDate startDate;
    private LocalDate endDate;
    private BudgetStatus status;
    private BudgetScopeType scopeType;
    private String department;
    private Long fundId;
    private String fundName;
    private Long campaignId;
    private String campaignName;
    private Long programId;
    private String programName;
    private BigDecimal totalBudget;
    private List<BudgetLineResponse> lines;
    private LocalDateTime createdAt;
}
