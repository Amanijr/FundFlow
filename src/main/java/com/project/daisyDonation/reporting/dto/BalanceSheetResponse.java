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
@Schema(description = "Response payload for balance sheet")
public class BalanceSheetResponse {

    private LocalDate asOfDate;
    private List<ReportLineItem> assets;
    private List<ReportLineItem> liabilities;
    private List<ReportLineItem> netAssets;
    private BigDecimal totalAssets;
    private BigDecimal totalLiabilities;
    private BigDecimal totalNetAssets;
    private BigDecimal totalLiabilitiesAndNetAssets;
}
