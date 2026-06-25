package com.project.daisyDonation.budget.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;

import com.project.daisyDonation.expense.entity.ExpenseCategory;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Budget Variance Line")
public class BudgetVarianceLine {

    private Long lineId;
    private ExpenseCategory category;
    private String department;
    private Long fundId;
    private String fundName;
    private BigDecimal budgetAmount;
    private BigDecimal actualAmount;
    private BigDecimal variance;
    private BigDecimal utilizationPercent;
}
