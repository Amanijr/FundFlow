package com.project.daisyDonation.accounting.service;

import java.time.LocalDate;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.project.daisyDonation.accounting.entity.AccountType;
import com.project.daisyDonation.accounting.entity.ChartOfAccount;
import com.project.daisyDonation.accounting.entity.FiscalPeriod;
import com.project.daisyDonation.accounting.entity.FiscalPeriodStatus;
import com.project.daisyDonation.accounting.repository.ChartOfAccountRepository;
import com.project.daisyDonation.accounting.repository.FiscalPeriodRepository;
import com.project.daisyDonation.organization.entity.Organization;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ChartOfAccountSetupService {

    private final ChartOfAccountRepository chartOfAccountRepository;
    private final FiscalPeriodRepository fiscalPeriodRepository;

    @Transactional
    public void initializeForOrganization(Organization organization) {
        if (chartOfAccountRepository.existsByOrganizationIdAndDeletedFalse(organization.getId())) {
            return;
        }

        createFiscalPeriod(organization);
        createAccount(organization, AccountCodes.CASH, "Cash", AccountType.ASSET, "Cash on hand and in bank", true);
        createAccount(organization, AccountCodes.IN_KIND_CONTRIBUTIONS, "In-Kind Contributions",
                AccountType.ASSET, "Non-cash donated goods and services", true);
        createAccount(organization, AccountCodes.DONATION_REVENUE, "Donation Revenue",
                AccountType.REVENUE, "Contributions and donations received", true);
        createAccount(organization, AccountCodes.OPERATIONS_EXPENSE, "Operations Expense",
                AccountType.EXPENSE, "General operating expenses", true);
        createAccount(organization, AccountCodes.PROGRAM_EXPENSE, "Program Expense",
                AccountType.EXPENSE, "Program delivery expenses", true);
        createAccount(organization, AccountCodes.ADMINISTRATIVE_EXPENSE, "Administrative Expense",
                AccountType.EXPENSE, "Administrative overhead", true);
        createAccount(organization, AccountCodes.FUNDRAISING_EXPENSE, "Fundraising Expense",
                AccountType.EXPENSE, "Fundraising and development costs", true);
        createAccount(organization, AccountCodes.MISCELLANEOUS_EXPENSE, "Miscellaneous Expense",
                AccountType.EXPENSE, "Other expenses", true);
    }

    private void createFiscalPeriod(Organization organization) {
        if (fiscalPeriodRepository.existsByOrganizationIdAndDeletedFalse(organization.getId())) {
            return;
        }

        int year = LocalDate.now().getYear();
        FiscalPeriod period = new FiscalPeriod();
        period.setOrganization(organization);
        period.setName(String.valueOf(year));
        period.setStartDate(LocalDate.of(year, 1, 1));
        period.setEndDate(LocalDate.of(year, 12, 31));
        period.setStatus(FiscalPeriodStatus.OPEN);
        fiscalPeriodRepository.save(period);
    }

    private void createAccount(
            Organization organization,
            String code,
            String name,
            AccountType type,
            String description,
            boolean systemAccount) {
        ChartOfAccount account = new ChartOfAccount();
        account.setOrganization(organization);
        account.setCode(code);
        account.setName(name);
        account.setAccountType(type);
        account.setDescription(description);
        account.setSystemAccount(systemAccount);
        account.setActive(true);
        chartOfAccountRepository.save(account);
    }
}
