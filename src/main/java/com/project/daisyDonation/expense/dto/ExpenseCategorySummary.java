package com.project.daisyDonation.expense.dto;

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
@Schema(description = "Expense Category Summary")
public class ExpenseCategorySummary {

    private ExpenseCategory category;
    private BigDecimal totalPaidAmount;
    private long expenseCount;
}
