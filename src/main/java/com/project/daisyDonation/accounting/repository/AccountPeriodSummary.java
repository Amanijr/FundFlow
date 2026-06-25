package com.project.daisyDonation.accounting.repository;

import java.math.BigDecimal;

import com.project.daisyDonation.accounting.entity.AccountType;

public interface AccountPeriodSummary {

    Long getAccountId();

    String getAccountCode();

    String getAccountName();

    AccountType getAccountType();

    BigDecimal getTotalDebits();

    BigDecimal getTotalCredits();
}
