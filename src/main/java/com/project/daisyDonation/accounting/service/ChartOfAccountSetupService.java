package com.project.daisyDonation.accounting.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.project.daisyDonation.accounting.entity.AccountType;
import com.project.daisyDonation.accounting.entity.ChartOfAccount;
import com.project.daisyDonation.accounting.entity.FiscalPeriod;
import com.project.daisyDonation.accounting.entity.FiscalPeriodStatus;
import com.project.daisyDonation.accounting.repository.ChartOfAccountRepository;
import com.project.daisyDonation.accounting.repository.FiscalPeriodRepository;
import com.project.daisyDonation.organization.entity.Organization;
import com.project.daisyDonation.organization.entity.OrganizationType;

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
        for (AccountSeed seed : seedsFor(organization.getType())) {
            createAccount(organization, seed);
        }
    }

    private List<AccountSeed> seedsFor(OrganizationType type) {
        if (type == null) {
            return nonprofitSeeds();
        }
        return switch (type) {
            case CHURCH, RELIGIOUS_INSTITUTION -> churchSeeds();
            case SCHOOL -> schoolSeeds();
            case FOUNDATION -> foundationSeeds();
            case NGO, CHARITY, COMMUNITY_ORGANIZATION -> nonprofitSeeds();
        };
    }

    /**
     * Default chart for churches in Tanzania (tithes, offerings, mobile money / bank).
     * System codes used by posting keep their numbers; labels match church language.
     */
    private List<AccountSeed> churchSeeds() {
        return List.of(
                seed(AccountCodes.CASH, "Cash on Hand", AccountType.ASSET,
                        "Cash counted from services and kept in the church till", true),
                seed(AccountCodes.BANK, "Bank Account", AccountType.ASSET,
                        "Church bank account (e.g. CRDB, NMB, Equity)", false),
                seed(AccountCodes.MOBILE_MONEY, "Mobile Money / Lipa", AccountType.ASSET,
                        "M-Pesa, Tigo Pesa, Airtel Money, or Lipa float", false),
                seed(AccountCodes.IN_KIND_CONTRIBUTIONS, "In-Kind Contributions", AccountType.ASSET,
                        "Goods and services given to the church", true),
                seed(AccountCodes.DONATION_REVENUE, "Tithes, Offerings & Gifts", AccountType.REVENUE,
                        "All contribution income posted automatically from gifts and collections", true),
                seed(AccountCodes.TITHE_REVENUE, "Tithes", AccountType.REVENUE,
                        "Optional detail account for tithe tracking (use funds or manual split)", false),
                seed(AccountCodes.OFFERING_REVENUE, "Offerings & Collections", AccountType.REVENUE,
                        "Sunday and midweek offerings / group collections", false),
                seed(AccountCodes.BUILDING_REVENUE, "Building & Project Gifts", AccountType.REVENUE,
                        "Building fund, land, and capital project contributions", false),
                seed(AccountCodes.OPERATIONS_EXPENSE, "Church Operations", AccountType.EXPENSE,
                        "Utilities, rent, transport, maintenance, and day-to-day running costs", true),
                seed(AccountCodes.PROGRAM_EXPENSE, "Ministry & Programs", AccountType.EXPENSE,
                        "Youth, worship, cell groups, conferences, and ministry activities", true),
                seed(AccountCodes.ADMINISTRATIVE_EXPENSE, "Administration", AccountType.EXPENSE,
                        "Office, stationery, salaries support, and admin overhead", true),
                seed(AccountCodes.FUNDRAISING_EXPENSE, "Evangelism & Outreach", AccountType.EXPENSE,
                        "Outreach, crusades, missions, and member engagement costs", true),
                seed(AccountCodes.MISCELLANEOUS_EXPENSE, "Other Expenses", AccountType.EXPENSE,
                        "Expenses that do not fit another category", true));
    }

    private List<AccountSeed> schoolSeeds() {
        return List.of(
                seed(AccountCodes.CASH, "Cash", AccountType.ASSET,
                        "Cash on hand and petty cash", true),
                seed(AccountCodes.BANK, "Bank Account", AccountType.ASSET,
                        "School operating bank account", false),
                seed(AccountCodes.MOBILE_MONEY, "Mobile Money", AccountType.ASSET,
                        "Mobile wallet used for fees and disbursements", false),
                seed(AccountCodes.IN_KIND_CONTRIBUTIONS, "In-Kind Contributions", AccountType.ASSET,
                        "Donated books, equipment, and supplies", true),
                seed(AccountCodes.DONATION_REVENUE, "Fees, Sponsorships & Gifts", AccountType.REVENUE,
                        "Tuition support, sponsorships, and donations", true),
                seed(AccountCodes.OPERATIONS_EXPENSE, "School Operations", AccountType.EXPENSE,
                        "Facilities, utilities, and general operations", true),
                seed(AccountCodes.PROGRAM_EXPENSE, "Student Programs", AccountType.EXPENSE,
                        "Teaching materials, activities, and student support", true),
                seed(AccountCodes.ADMINISTRATIVE_EXPENSE, "Administration", AccountType.EXPENSE,
                        "Office and administrative overhead", true),
                seed(AccountCodes.FUNDRAISING_EXPENSE, "Fundraising & Development", AccountType.EXPENSE,
                        "Sponsorship drives and development costs", true),
                seed(AccountCodes.MISCELLANEOUS_EXPENSE, "Other Expenses", AccountType.EXPENSE,
                        "Other school expenses", true));
    }

    private List<AccountSeed> foundationSeeds() {
        return List.of(
                seed(AccountCodes.CASH, "Cash", AccountType.ASSET,
                        "Cash on hand and in bank", true),
                seed(AccountCodes.BANK, "Bank Account", AccountType.ASSET,
                        "Foundation bank accounts", false),
                seed(AccountCodes.IN_KIND_CONTRIBUTIONS, "In-Kind Contributions", AccountType.ASSET,
                        "Non-cash donated goods and services", true),
                seed(AccountCodes.DONATION_REVENUE, "Grants & Contributions", AccountType.REVENUE,
                        "Grants, endowments drawn for operations, and donations", true),
                seed(AccountCodes.OPERATIONS_EXPENSE, "Operations Expense", AccountType.EXPENSE,
                        "General operating expenses", true),
                seed(AccountCodes.PROGRAM_EXPENSE, "Grant & Program Expense", AccountType.EXPENSE,
                        "Program and grant-funded activities", true),
                seed(AccountCodes.ADMINISTRATIVE_EXPENSE, "Administrative Expense", AccountType.EXPENSE,
                        "Administrative overhead", true),
                seed(AccountCodes.FUNDRAISING_EXPENSE, "Fundraising Expense", AccountType.EXPENSE,
                        "Fundraising and donor stewardship", true),
                seed(AccountCodes.MISCELLANEOUS_EXPENSE, "Miscellaneous Expense", AccountType.EXPENSE,
                        "Other expenses", true));
    }

    private List<AccountSeed> nonprofitSeeds() {
        return List.of(
                seed(AccountCodes.CASH, "Cash", AccountType.ASSET,
                        "Cash on hand and in bank", true),
                seed(AccountCodes.BANK, "Bank Account", AccountType.ASSET,
                        "Organization bank account", false),
                seed(AccountCodes.MOBILE_MONEY, "Mobile Money", AccountType.ASSET,
                        "Mobile wallet float used for receipts and payments", false),
                seed(AccountCodes.IN_KIND_CONTRIBUTIONS, "In-Kind Contributions", AccountType.ASSET,
                        "Non-cash donated goods and services", true),
                seed(AccountCodes.DONATION_REVENUE, "Donation Revenue", AccountType.REVENUE,
                        "Contributions and donations received", true),
                seed(AccountCodes.OPERATIONS_EXPENSE, "Operations Expense", AccountType.EXPENSE,
                        "General operating expenses", true),
                seed(AccountCodes.PROGRAM_EXPENSE, "Program Expense", AccountType.EXPENSE,
                        "Program delivery expenses", true),
                seed(AccountCodes.ADMINISTRATIVE_EXPENSE, "Administrative Expense", AccountType.EXPENSE,
                        "Administrative overhead", true),
                seed(AccountCodes.FUNDRAISING_EXPENSE, "Fundraising Expense", AccountType.EXPENSE,
                        "Fundraising and development costs", true),
                seed(AccountCodes.MISCELLANEOUS_EXPENSE, "Miscellaneous Expense", AccountType.EXPENSE,
                        "Other expenses", true));
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

    private void createAccount(Organization organization, AccountSeed seed) {
        ChartOfAccount account = new ChartOfAccount();
        account.setOrganization(organization);
        account.setCode(seed.code());
        account.setName(seed.name());
        account.setAccountType(seed.type());
        account.setDescription(seed.description());
        account.setSystemAccount(seed.systemAccount());
        account.setActive(true);
        chartOfAccountRepository.save(account);
    }

    private static AccountSeed seed(
            String code,
            String name,
            AccountType type,
            String description,
            boolean systemAccount) {
        return new AccountSeed(code, name, type, description, systemAccount);
    }

    private record AccountSeed(
            String code,
            String name,
            AccountType type,
            String description,
            boolean systemAccount) {
    }
}
