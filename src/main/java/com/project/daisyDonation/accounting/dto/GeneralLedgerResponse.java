package com.project.daisyDonation.accounting.dto;

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
@Schema(description = "Response payload for general ledger")
public class GeneralLedgerResponse {

    private Long accountId;
    private String accountCode;
    private String accountName;
    private BigDecimal openingBalance;
    private BigDecimal closingBalance;
    private List<GeneralLedgerLine> lines;
}
