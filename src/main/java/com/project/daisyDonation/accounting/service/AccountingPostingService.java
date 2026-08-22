package com.project.daisyDonation.accounting.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.project.daisyDonation.donation.entity.Donation;
import com.project.daisyDonation.payment.entity.Payment;
import com.project.daisyDonation.common.exception.BadRequestException;
import com.project.daisyDonation.common.exception.ResourceNotFoundException;
import com.project.daisyDonation.accounting.entity.ChartOfAccount;
import com.project.daisyDonation.accounting.entity.FiscalPeriod;
import com.project.daisyDonation.accounting.entity.FiscalPeriodStatus;
import com.project.daisyDonation.accounting.entity.JournalEntry;
import com.project.daisyDonation.accounting.entity.JournalLine;
import com.project.daisyDonation.accounting.entity.JournalSourceType;
import com.project.daisyDonation.accounting.repository.ChartOfAccountRepository;
import com.project.daisyDonation.accounting.repository.FiscalPeriodRepository;
import com.project.daisyDonation.accounting.repository.JournalEntryRepository;
import com.project.daisyDonation.accounting.repository.JournalLineRepository;
import com.project.daisyDonation.expense.entity.Expense;
import com.project.daisyDonation.fund.entity.Fund;
import com.project.daisyDonation.organization.entity.Organization;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AccountingPostingService {

    private final ChartOfAccountSetupService chartOfAccountSetupService;
    private final LedgerAccountResolver ledgerAccountResolver;
    private final ChartOfAccountRepository chartOfAccountRepository;
    private final FiscalPeriodRepository fiscalPeriodRepository;
    private final JournalEntryRepository journalEntryRepository;
    private final JournalLineRepository journalLineRepository;

    @Transactional
    public void postDonationPayment(Organization organization, Long userId, Donation donation, Payment payment) {
        chartOfAccountSetupService.initializeForOrganization(organization);
        if (journalEntryRepository.existsByOrganizationIdAndSourceTypeAndSourceIdAndDeletedFalse(
                organization.getId(), JournalSourceType.DONATION_PAYMENT, payment.getId())) {
            return;
        }

        JournalSourceType sourceType = donation.getDonationType() == com.project.daisyDonation.donation.entity.DonationType.COLLECTION
                ? JournalSourceType.COLLECTION_PAYMENT
                : JournalSourceType.DONATION_PAYMENT;

        LocalDate entryDate = toEntryDate(payment.getProcessedAt() != null
                ? payment.getProcessedAt()
                : donation.getDonationTime());

        String assetCode = ledgerAccountResolver.assetAccount(organization, payment.getPaymentMethod());
        String incomeCode = ledgerAccountResolver.contributionIncomeAccount(organization, donation);
        Fund fund = donation.getFund();
        String methodLabel = payment.getPaymentMethod() != null
                ? payment.getPaymentMethod().name().replace('_', ' ').toLowerCase()
                : "receipt";

        postBalancedEntry(
                organization,
                userId,
                entryDate,
                sourceType,
                payment.getId(),
                "Gift received - " + donation.getAmount() + " via " + methodLabel,
                List.of(
                        line(assetCode, donation.getAmount(), BigDecimal.ZERO, fund, "Received via " + methodLabel),
                        line(incomeCode, BigDecimal.ZERO, donation.getAmount(), fund, "Contribution income")));
    }

    @Transactional
    public void postInKindDonation(Organization organization, Long userId, Donation donation) {
        chartOfAccountSetupService.initializeForOrganization(organization);
        if (journalEntryRepository.existsByOrganizationIdAndSourceTypeAndSourceIdAndDeletedFalse(
                organization.getId(), JournalSourceType.IN_KIND_DONATION, donation.getId())) {
            return;
        }

        LocalDate entryDate = toEntryDate(donation.getDonationTime());
        String assetCode = ledgerAccountResolver.inKindAssetAccount(organization);
        String incomeCode = ledgerAccountResolver.contributionIncomeAccount(organization, donation);

        postBalancedEntry(
                organization,
                userId,
                entryDate,
                JournalSourceType.IN_KIND_DONATION,
                donation.getId(),
                "In-kind donation - " + donation.getAmount(),
                List.of(
                        line(assetCode, donation.getAmount(), BigDecimal.ZERO, donation.getFund(),
                                "In-kind contribution"),
                        line(incomeCode, BigDecimal.ZERO, donation.getAmount(), donation.getFund(),
                                "Contribution income")));
    }

    @Transactional
    public void postExpensePayment(Organization organization, Long userId, Expense expense) {
        chartOfAccountSetupService.initializeForOrganization(organization);
        if (journalEntryRepository.existsByOrganizationIdAndSourceTypeAndSourceIdAndDeletedFalse(
                organization.getId(), JournalSourceType.EXPENSE_PAYMENT, expense.getId())) {
            return;
        }

        String expenseAccountCode = ledgerAccountResolver.expenseAccount(organization, expense.getCategory());
        String creditAccountCode = ledgerAccountResolver.expenseCreditAccount(organization, expense);
        LocalDate entryDate = toEntryDate(expense.getPaidAt());
        Fund fund = expense.getFund();

        postBalancedEntry(
                organization,
                userId,
                entryDate,
                JournalSourceType.EXPENSE_PAYMENT,
                expense.getId(),
                "Expense paid - " + expense.getTitle(),
                List.of(
                        line(expenseAccountCode, expense.getAmount(), BigDecimal.ZERO, fund, expense.getTitle()),
                        line(creditAccountCode, BigDecimal.ZERO, expense.getAmount(), fund, "Paid from till / bank / Lipa")));
    }

    private void postBalancedEntry(
            Organization organization,
            Long userId,
            LocalDate entryDate,
            JournalSourceType sourceType,
            Long sourceId,
            String description,
            List<PostingLine> lines) {
        chartOfAccountSetupService.initializeForOrganization(organization);

        BigDecimal totalDebits = lines.stream().map(PostingLine::debit).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalCredits = lines.stream().map(PostingLine::credit).reduce(BigDecimal.ZERO, BigDecimal::add);

        if (totalDebits.compareTo(totalCredits) != 0) {
            throw new BadRequestException("Journal entry is not balanced");
        }

        FiscalPeriod fiscalPeriod = fiscalPeriodRepository
                .findOpenPeriodContaining(organization.getId(), entryDate, FiscalPeriodStatus.OPEN)
                .orElseThrow(() -> new BadRequestException("No open fiscal period for entry date"));

        JournalEntry entry = new JournalEntry();
        entry.setOrganization(organization);
        entry.setFiscalPeriod(fiscalPeriod);
        entry.setEntryDate(entryDate);
        entry.setDescription(description);
        entry.setSourceType(sourceType);
        entry.setSourceId(sourceId);
        entry.setPostedByUserId(userId);
        entry = journalEntryRepository.save(entry);

        for (PostingLine postingLine : lines) {
            ChartOfAccount account = chartOfAccountRepository
                    .findByOrganizationIdAndCodeAndDeletedFalse(organization.getId(), postingLine.accountCode())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Account not found: " + postingLine.accountCode()));

            JournalLine journalLine = new JournalLine();
            journalLine.setJournalEntry(entry);
            journalLine.setAccount(account);
            journalLine.setFund(postingLine.fund());
            journalLine.setDebitAmount(postingLine.debit());
            journalLine.setCreditAmount(postingLine.credit());
            journalLine.setLineDescription(postingLine.description());
            journalLineRepository.save(journalLine);
        }
    }

    private PostingLine line(String accountCode, BigDecimal debit, BigDecimal credit, Fund fund, String description) {
        return new PostingLine(accountCode, debit, credit, fund, description);
    }

    private LocalDate toEntryDate(LocalDateTime dateTime) {
        if (dateTime == null) {
            return LocalDate.now();
        }
        return dateTime.toLocalDate();
    }

    private record PostingLine(String accountCode, BigDecimal debit, BigDecimal credit, Fund fund, String description) {
    }
}
