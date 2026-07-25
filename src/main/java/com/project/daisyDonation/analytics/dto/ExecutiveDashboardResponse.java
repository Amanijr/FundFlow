package com.project.daisyDonation.analytics.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Executive dashboard KPIs for the selected reporting period")
public class ExecutiveDashboardResponse {

    @Schema(description = "Reporting period start", example = "2026-01-01")
    private LocalDate fromDate;

    @Schema(description = "Reporting period end", example = "2026-06-24")
    private LocalDate toDate;

    @Schema(description = "Total completed donations in the period", example = "1500.00")
    private BigDecimal totalDonations;

    @Schema(description = "Total paid/reconciled expenses in the period", example = "400.00")
    private BigDecimal totalExpenses;

    @Schema(description = "Donations minus expenses", example = "1100.00")
    private BigDecimal netPosition;

    @Schema(description = "Cash ledger balance (account 1000)", example = "1100.00")
    private BigDecimal cashBalance;

    @Schema(description = "Sum of operational fund balances", example = "2600.00")
    private BigDecimal totalFundBalance;

    @Schema(description = "Donation growth vs prior period of equal length (%)", example = "25.00")
    private BigDecimal donationGrowthPercent;

    @Schema(description = "Expense growth vs prior period of equal length (%)", example = "10.00")
    private BigDecimal expenseGrowthPercent;

    @Schema(description = "Distinct donors who gave in the period", example = "1")
    private long donorCount;

    @Schema(description = "Average completed donation amount", example = "1500.00")
    private BigDecimal averageDonation;

    @Schema(description = "Number of active campaigns", example = "1")
    private long activeCampaignCount;

    @Schema(description = "Active organization budget utilization (%)", example = "45.50", nullable = true)
    private BigDecimal budgetUtilizationPercent;

    @Schema(description = "Expenses awaiting approval or payment", example = "0")
    private long pendingExpenseCount;
}
