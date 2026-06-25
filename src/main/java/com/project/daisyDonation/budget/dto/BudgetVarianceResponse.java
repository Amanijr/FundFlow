package com.project.daisyDonation.budget.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;
import java.time.LocalDate;
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
@Schema(description = "Response payload for budget variance")
public class BudgetVarianceResponse {

    private Long budgetId;
    private String budgetName;
    private BudgetStatus status;
    private BudgetScopeType scopeType;
    private LocalDate fromDate;
    private LocalDate toDate;
    private List<BudgetVarianceLine> lines;
    private BigDecimal totalBudget;
    private BigDecimal totalActual;
    private BigDecimal totalVariance;
    private BigDecimal utilizationPercent;
}
