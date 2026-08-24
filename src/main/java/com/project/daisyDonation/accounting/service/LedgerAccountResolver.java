package com.project.daisyDonation.accounting.service;

import java.util.Locale;
import java.util.Optional;

import org.springframework.stereotype.Component;

import com.project.daisyDonation.accounting.repository.ChartOfAccountRepository;
import com.project.daisyDonation.donation.entity.Donation;
import com.project.daisyDonation.donation.entity.DonationType;
import com.project.daisyDonation.expense.entity.Expense;
import com.project.daisyDonation.expense.entity.ExpenseCategory;
import com.project.daisyDonation.fund.entity.Fund;
import com.project.daisyDonation.organization.entity.Organization;
import com.project.daisyDonation.payment.entity.PaymentMethod;

import lombok.RequiredArgsConstructor;

/**
 * Picks ledger accounts from the organization's chart based on how money actually moved.
 * Tanzanian church/NGO defaults (cash till, bank, Lipa/M-Pesa, zaka, sadaka) with fallbacks
 * so orgs that never seeded optional codes still post to Cash and contribution income.
 */
@Component
@RequiredArgsConstructor
public class LedgerAccountResolver {

    private final ChartOfAccountRepository chartOfAccountRepository;

    public String assetAccount(Organization organization, PaymentMethod method) {
        if (method == null) {
            return firstExisting(organization, AccountCodes.CASH);
        }
        return switch (method) {
            case CASH -> firstExisting(organization, AccountCodes.CASH);
            case MOBILE_MONEY -> firstExisting(organization, AccountCodes.MOBILE_MONEY, AccountCodes.CASH);
            case BANK_TRANSFER, CHEQUE -> firstExisting(organization, AccountCodes.BANK, AccountCodes.CASH);
            case CARD -> firstExisting(organization, AccountCodes.BANK, AccountCodes.MOBILE_MONEY, AccountCodes.CASH);
        };
    }

    public String contributionIncomeAccount(Organization organization, Donation donation) {
        if (donation.getDonationType() == DonationType.COLLECTION) {
            return firstExisting(organization, AccountCodes.OFFERING_REVENUE, AccountCodes.DONATION_REVENUE);
        }

        String haystack = haystack(donation);
        if (matches(haystack, "tithe", "zaka", "ushuru", "tenth")) {
            return firstExisting(organization, AccountCodes.TITHE_REVENUE, AccountCodes.DONATION_REVENUE);
        }
        if (matches(haystack, "building", "construction", "kanisa", "kiwanja", "project", "capital")) {
            return firstExisting(organization, AccountCodes.BUILDING_REVENUE, AccountCodes.DONATION_REVENUE);
        }
        if (matches(haystack, "offering", "sadaka", "collection", "ibada", "sunday", "service")) {
            return firstExisting(organization, AccountCodes.OFFERING_REVENUE, AccountCodes.DONATION_REVENUE);
        }
        return firstExisting(organization, AccountCodes.DONATION_REVENUE);
    }

    public String inKindAssetAccount(Organization organization) {
        return firstExisting(organization, AccountCodes.IN_KIND_CONTRIBUTIONS, AccountCodes.CASH);
    }

    public String expenseAccount(Organization organization, ExpenseCategory category) {
        String preferred = switch (category) {
            case OPERATIONS -> AccountCodes.OPERATIONS_EXPENSE;
            case PROGRAM -> AccountCodes.PROGRAM_EXPENSE;
            case ADMINISTRATIVE -> AccountCodes.ADMINISTRATIVE_EXPENSE;
            case FUNDRAISING -> AccountCodes.FUNDRAISING_EXPENSE;
            case MISCELLANEOUS -> AccountCodes.MISCELLANEOUS_EXPENSE;
        };
        return firstExisting(organization, preferred, AccountCodes.MISCELLANEOUS_EXPENSE, AccountCodes.OPERATIONS_EXPENSE);
    }

    public String expenseCreditAccount(Organization organization, Expense expense) {
        return assetAccount(organization, expense.getPaymentMethod());
    }

    public String firstExisting(Organization organization, String... codes) {
        Long organizationId = organization.getId();
        for (String code : codes) {
            if (code == null || code.isBlank()) {
                continue;
            }
            Optional<?> account = chartOfAccountRepository
                    .findByOrganizationIdAndCodeAndDeletedFalse(organizationId, code);
            if (account.isPresent()) {
                return code;
            }
        }
        throw new IllegalStateException("No posting account available for organization " + organizationId);
    }

    private String haystack(Donation donation) {
        StringBuilder text = new StringBuilder();
        Fund fund = donation.getFund();
        if (fund != null) {
            append(text, fund.getCode());
            append(text, fund.getName());
            append(text, fund.getDescription());
        }
        if (donation.getCampaign() != null) {
            append(text, donation.getCampaign().getName());
            append(text, donation.getCampaign().getDescription());
        }
        append(text, donation.getSource());
        append(text, donation.getNotes());
        if (donation.getDonationType() != null) {
            append(text, donation.getDonationType().name());
        }
        return text.toString();
    }

    private void append(StringBuilder target, String value) {
        if (value != null && !value.isBlank()) {
            target.append(' ').append(value);
        }
    }

    private boolean matches(String haystack, String... needles) {
        if (haystack.isBlank()) {
            return false;
        }
        String normalized = haystack.toLowerCase(Locale.ROOT);
        for (String needle : needles) {
            if (normalized.contains(needle)) {
                return true;
            }
        }
        return false;
    }
}
