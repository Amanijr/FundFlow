package com.project.daisyDonation.accounting.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.project.daisyDonation.accounting.dto.ChartOfAccountRequest;
import com.project.daisyDonation.accounting.dto.ChartOfAccountResponse;
import com.project.daisyDonation.accounting.dto.GeneralLedgerLine;
import com.project.daisyDonation.accounting.dto.GeneralLedgerResponse;
import com.project.daisyDonation.accounting.dto.JournalEntryResponse;
import com.project.daisyDonation.accounting.dto.JournalLineResponse;
import com.project.daisyDonation.accounting.dto.TrialBalanceLine;
import com.project.daisyDonation.accounting.dto.TrialBalanceResponse;
import com.project.daisyDonation.accounting.entity.ChartOfAccount;
import com.project.daisyDonation.accounting.entity.JournalEntry;
import com.project.daisyDonation.accounting.entity.JournalLine;
import com.project.daisyDonation.accounting.repository.ChartOfAccountRepository;
import com.project.daisyDonation.accounting.repository.JournalEntryRepository;
import com.project.daisyDonation.accounting.repository.JournalLineRepository;
import com.project.daisyDonation.common.exception.ConflictException;
import com.project.daisyDonation.common.exception.ResourceNotFoundException;
import com.project.daisyDonation.common.security.UserPrincipal;
import com.project.daisyDonation.common.service.TenantSupport;
import com.project.daisyDonation.organization.entity.Organization;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AccountingService {

    private final ChartOfAccountRepository chartOfAccountRepository;
    private final JournalEntryRepository journalEntryRepository;
    private final JournalLineRepository journalLineRepository;
    private final ChartOfAccountSetupService chartOfAccountSetupService;
    private final TenantSupport tenantSupport;

    @Transactional
    public void initialize(UserPrincipal principal) {
        Organization organization = tenantSupport.organization(principal);
        chartOfAccountSetupService.initializeForOrganization(organization);
    }

    @Transactional
    public ChartOfAccountResponse createAccount(UserPrincipal principal, ChartOfAccountRequest request) {
        Organization organization = tenantSupport.organization(principal);
        chartOfAccountSetupService.initializeForOrganization(organization);

        if (chartOfAccountRepository.findByOrganizationIdAndCodeAndDeletedFalse(
                organization.getId(), request.getCode()).isPresent()) {
            throw new ConflictException("Account code already exists");
        }

        ChartOfAccount account = new ChartOfAccount();
        account.setOrganization(organization);
        account.setCode(request.getCode());
        account.setName(request.getName());
        account.setAccountType(request.getAccountType());
        account.setDescription(request.getDescription());
        account.setActive(request.isActive());
        account.setSystemAccount(false);

        return toAccountResponse(chartOfAccountRepository.save(account));
    }

    @Transactional(readOnly = true)
    public List<ChartOfAccountResponse> listAccounts(UserPrincipal principal) {
        Long organizationId = tenantSupport.organizationId(principal);
        return chartOfAccountRepository.findByOrganizationIdAndDeletedFalse(organizationId).stream()
                .sorted(Comparator.comparing(ChartOfAccount::getCode))
                .map(this::toAccountResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<JournalEntryResponse> listJournalEntries(UserPrincipal principal) {
        Long organizationId = tenantSupport.organizationId(principal);
        return journalEntryRepository.findByOrganizationIdAndDeletedFalseOrderByEntryDateDescCreatedAtDesc(organizationId)
                .stream()
                .map(this::toJournalEntryResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public JournalEntryResponse getJournalEntry(UserPrincipal principal, Long entryId) {
        Long organizationId = tenantSupport.organizationId(principal);
        JournalEntry entry = journalEntryRepository.findByIdAndOrganizationIdAndDeletedFalse(entryId, organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("Journal entry not found"));
        return toJournalEntryResponse(entry);
    }

    @Transactional(readOnly = true)
    public TrialBalanceResponse getTrialBalance(UserPrincipal principal) {
        Long organizationId = tenantSupport.organizationId(principal);
        List<TrialBalanceLine> lines = new ArrayList<>();
        BigDecimal totalDebits = BigDecimal.ZERO;
        BigDecimal totalCredits = BigDecimal.ZERO;

        for (ChartOfAccount account : chartOfAccountRepository.findByOrganizationIdAndDeletedFalse(organizationId)) {
            BigDecimal debits = journalLineRepository.sumDebitsByAccount(organizationId, account.getId());
            BigDecimal credits = journalLineRepository.sumCreditsByAccount(organizationId, account.getId());

            if (debits.compareTo(BigDecimal.ZERO) == 0 && credits.compareTo(BigDecimal.ZERO) == 0) {
                continue;
            }

            BigDecimal balance = debits.subtract(credits);
            lines.add(TrialBalanceLine.builder()
                    .accountCode(account.getCode())
                    .accountName(account.getName())
                    .accountType(account.getAccountType())
                    .totalDebits(debits)
                    .totalCredits(credits)
                    .balance(balance)
                    .build());

            totalDebits = totalDebits.add(debits);
            totalCredits = totalCredits.add(credits);
        }

        lines.sort(Comparator.comparing(TrialBalanceLine::getAccountCode));

        return TrialBalanceResponse.builder()
                .totalDebits(totalDebits)
                .totalCredits(totalCredits)
                .lines(lines)
                .build();
    }

    @Transactional(readOnly = true)
    public GeneralLedgerResponse getGeneralLedger(UserPrincipal principal, Long accountId, LocalDate from, LocalDate to) {
        Long organizationId = tenantSupport.organizationId(principal);
        ChartOfAccount account = chartOfAccountRepository.findByOrganizationIdAndDeletedFalse(organizationId).stream()
                .filter(a -> a.getId().equals(accountId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));

        List<JournalLine> lines = journalLineRepository.findLedgerLines(organizationId, accountId, from, to);
        BigDecimal runningBalance = BigDecimal.ZERO;
        List<GeneralLedgerLine> ledgerLines = new ArrayList<>();

        for (JournalLine line : lines) {
            runningBalance = runningBalance.add(line.getDebitAmount()).subtract(line.getCreditAmount());
            ledgerLines.add(GeneralLedgerLine.builder()
                    .entryDate(line.getJournalEntry().getEntryDate())
                    .description(line.getJournalEntry().getDescription())
                    .lineDescription(line.getLineDescription())
                    .debitAmount(line.getDebitAmount())
                    .creditAmount(line.getCreditAmount())
                    .runningBalance(runningBalance)
                    .build());
        }

        BigDecimal totalDebits = journalLineRepository.sumDebitsByAccount(organizationId, accountId);
        BigDecimal totalCredits = journalLineRepository.sumCreditsByAccount(organizationId, accountId);

        return GeneralLedgerResponse.builder()
                .accountId(account.getId())
                .accountCode(account.getCode())
                .accountName(account.getName())
                .openingBalance(BigDecimal.ZERO)
                .closingBalance(totalDebits.subtract(totalCredits))
                .lines(ledgerLines)
                .build();
    }

    private JournalEntryResponse toJournalEntryResponse(JournalEntry entry) {
        List<JournalLine> lines = journalLineRepository.findByJournalEntryIdAndDeletedFalse(entry.getId());
        BigDecimal totalDebits = lines.stream().map(JournalLine::getDebitAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalCredits = lines.stream().map(JournalLine::getCreditAmount).reduce(BigDecimal.ZERO, BigDecimal::add);

        return JournalEntryResponse.builder()
                .id(entry.getId())
                .entryDate(entry.getEntryDate())
                .description(entry.getDescription())
                .sourceType(entry.getSourceType())
                .sourceId(entry.getSourceId())
                .postedByUserId(entry.getPostedByUserId())
                .fiscalPeriodName(entry.getFiscalPeriod().getName())
                .totalDebits(totalDebits)
                .totalCredits(totalCredits)
                .lines(lines.stream().map(this::toLineResponse).toList())
                .build();
    }

    private JournalLineResponse toLineResponse(JournalLine line) {
        return JournalLineResponse.builder()
                .id(line.getId())
                .accountCode(line.getAccount().getCode())
                .accountName(line.getAccount().getName())
                .fundId(line.getFund() != null ? line.getFund().getId() : null)
                .fundName(line.getFund() != null ? line.getFund().getName() : null)
                .debitAmount(line.getDebitAmount())
                .creditAmount(line.getCreditAmount())
                .lineDescription(line.getLineDescription())
                .build();
    }

    private ChartOfAccountResponse toAccountResponse(ChartOfAccount account) {
        return ChartOfAccountResponse.builder()
                .id(account.getId())
                .code(account.getCode())
                .name(account.getName())
                .accountType(account.getAccountType())
                .description(account.getDescription())
                .active(account.isActive())
                .systemAccount(account.isSystemAccount())
                .createdAt(account.getCreatedAt())
                .build();
    }
}
