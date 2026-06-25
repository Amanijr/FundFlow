package com.project.daisyDonation.reporting.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;
import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Response payload for cash flow")
public class CashFlowResponse {

    private LocalDate fromDate;
    private LocalDate toDate;
    private BigDecimal openingCash;
    private BigDecimal cashInflows;
    private BigDecimal cashOutflows;
    private BigDecimal netCashChange;
    private BigDecimal closingCash;
}
