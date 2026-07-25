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
@Schema(description = "Response payload for budget line")
public class BudgetLineResponse {

    private Long id;
    private ExpenseCategory category;
    private String department;
    private Long fundId;
    private String fundName;
    private BigDecimal amount;
    private String description;
}
