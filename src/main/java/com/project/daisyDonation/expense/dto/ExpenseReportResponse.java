package com.project.daisyDonation.expense.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Response payload for expense report")
public class ExpenseReportResponse {

    private BigDecimal totalPaidAmount;
    private long pendingApprovals;
    private long paidCount;
    private long reconciledCount;
    private List<ExpenseCategorySummary> byCategory;
    private List<ExpenseResponse> recentExpenses;
}
