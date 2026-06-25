package com.project.daisyDonation.accounting.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;

import com.project.daisyDonation.accounting.entity.AccountType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Trial Balance Line")
public class TrialBalanceLine {

    private String accountCode;
    private String accountName;
    private AccountType accountType;
    private BigDecimal totalDebits;
    private BigDecimal totalCredits;
    private BigDecimal balance;
}
