package com.project.daisyDonation.accounting.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Response payload for journal line")
public class JournalLineResponse {

    private Long id;
    private String accountCode;
    private String accountName;
    private Long fundId;
    private String fundName;
    private BigDecimal debitAmount;
    private BigDecimal creditAmount;
    private String lineDescription;
}
