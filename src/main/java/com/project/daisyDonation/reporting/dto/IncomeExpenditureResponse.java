package com.project.daisyDonation.reporting.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Response payload for income expenditure")
public class IncomeExpenditureResponse {

    private LocalDate fromDate;
    private LocalDate toDate;
    private List<ReportLineItem> revenueLines;
    private List<ReportLineItem> expenseLines;
    private BigDecimal totalRevenue;
    private BigDecimal totalExpenses;
    private BigDecimal netSurplus;
}
