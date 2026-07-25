package com.project.daisyDonation.reporting.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.project.daisyDonation.accounting.entity.AccountType;
import com.project.daisyDonation.accounting.repository.AccountPeriodSummary;
import com.project.daisyDonation.accounting.repository.JournalLineRepository;
import com.project.daisyDonation.accounting.service.AccountCodes;
import com.project.daisyDonation.budget.dto.BudgetVarianceLine;
import com.project.daisyDonation.budget.dto.BudgetVarianceResponse;
import com.project.daisyDonation.budget.service.BudgetService;
import com.project.daisyDonation.common.security.UserPrincipal;
import com.project.daisyDonation.expense.entity.ExpenseCategory;
import com.project.daisyDonation.common.service.TenantSupport;
import com.project.daisyDonation.fund.entity.Fund;
import com.project.daisyDonation.fund.repository.FundRepository;
import com.project.daisyDonation.fund.service.FundBalanceService;
import com.project.daisyDonation.reporting.dto.BalanceSheetResponse;
import com.project.daisyDonation.reporting.dto.BudgetReportLine;
import com.project.daisyDonation.reporting.dto.BudgetReportResponse;
import com.project.daisyDonation.reporting.dto.CashFlowResponse;
import com.project.daisyDonation.reporting.dto.FundReportLine;
import com.project.daisyDonation.reporting.dto.FundReportResponse;
import com.project.daisyDonation.reporting.dto.IncomeExpenditureResponse;
import com.project.daisyDonation.reporting.dto.ReportLineItem;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class FinancialReportingService {

    private static final String NO_ACTIVE_BUDGET_NOTE =
            "No active organization budget found for this period. Configure budgets under /api/v1/budgets.";

    private final JournalLineRepository journalLineRepository;
    private final FundRepository fundRepository;
    private final FundBalanceService fundBalanceService;
    private final BudgetService budgetService;
    private final TenantSupport tenantSupport;

    @Transactional(readOnly = true)
    public IncomeExpenditureResponse getIncomeExpenditure(
            UserPrincipal principal, LocalDate from, LocalDate to) {
        Long organizationId = tenantSupport.organizationId(principal);
        LocalDate fromDate = resolveFromDate(from);
        LocalDate toDate = resolveToDate(to);

        List<AccountPeriodSummary> summaries = journalLineRepository.summarizeByAccount(
                organizationId, fromDate, toDate, null);

        List<ReportLineItem> revenueLines = new ArrayList<>();
        List<ReportLineItem> expenseLines = new ArrayList<>();
        BigDecimal totalRevenue = BigDecimal.ZERO;
        BigDecimal totalExpenses = BigDecimal.ZERO;

        for (AccountPeriodSummary summary : summaries) {
            if (summary.getAccountType() == AccountType.REVENUE) {
                BigDecimal amount = creditNormalBalance(summary);
                if (amount.compareTo(BigDecimal.ZERO) != 0) {
                    revenueLines.add(lineItem(summary, amount));
                    totalRevenue = totalRevenue.add(amount);
                }
            } else if (summary.getAccountType() == AccountType.EXPENSE) {
                BigDecimal amount = debitNormalBalance(summary);
                if (amount.compareTo(BigDecimal.ZERO) != 0) {
                    expenseLines.add(lineItem(summary, amount));
                    totalExpenses = totalExpenses.add(amount);
                }
            }
        }

        return IncomeExpenditureResponse.builder()
                .fromDate(fromDate)
                .toDate(toDate)
                .revenueLines(revenueLines)
                .expenseLines(expenseLines)
                .totalRevenue(totalRevenue)
                .totalExpenses(totalExpenses)
                .netSurplus(totalRevenue.subtract(totalExpenses))
                .build();
    }

    @Transactional(readOnly = true)
    public BalanceSheetResponse getBalanceSheet(UserPrincipal principal, LocalDate asOf) {
        Long organizationId = tenantSupport.organizationId(principal);
        LocalDate asOfDate = asOf != null ? asOf : LocalDate.now();

        List<AccountPeriodSummary> summaries = journalLineRepository.summarizeByAccount(
                organizationId, null, asOfDate, null);

        List<ReportLineItem> assets = new ArrayList<>();
        List<ReportLineItem> liabilities = new ArrayList<>();
        List<ReportLineItem> equityAccounts = new ArrayList<>();
        BigDecimal totalAssets = BigDecimal.ZERO;
        BigDecimal totalLiabilities = BigDecimal.ZERO;
        BigDecimal totalEquityAccounts = BigDecimal.ZERO;
        BigDecimal cumulativeRevenue = BigDecimal.ZERO;
        BigDecimal cumulativeExpenses = BigDecimal.ZERO;

        for (AccountPeriodSummary summary : summaries) {
            switch (summary.getAccountType()) {
                case ASSET -> {
                    BigDecimal amount = debitNormalBalance(summary);
                    if (amount.compareTo(BigDecimal.ZERO) != 0) {
                        assets.add(lineItem(summary, amount));
                        totalAssets = totalAssets.add(amount);
                    }
                }
                case LIABILITY -> {
                    BigDecimal amount = creditNormalBalance(summary);
                    if (amount.compareTo(BigDecimal.ZERO) != 0) {
                        liabilities.add(lineItem(summary, amount));
                        totalLiabilities = totalLiabilities.add(amount);
                    }
                }
                case EQUITY -> {
                    BigDecimal amount = creditNormalBalance(summary);
                    if (amount.compareTo(BigDecimal.ZERO) != 0) {
                        equityAccounts.add(lineItem(summary, amount));
                        totalEquityAccounts = totalEquityAccounts.add(amount);
                    }
                }
                case REVENUE -> cumulativeRevenue = cumulativeRevenue.add(creditNormalBalance(summary));
                case EXPENSE -> cumulativeExpenses = cumulativeExpenses.add(debitNormalBalance(summary));
                default -> {
                }
            }
        }

        BigDecimal accumulatedSurplus = cumulativeRevenue.subtract(cumulativeExpenses);
        List<ReportLineItem> netAssets = new ArrayList<>(equityAccounts);
        if (accumulatedSurplus.compareTo(BigDecimal.ZERO) != 0) {
            netAssets.add(ReportLineItem.builder()
                    .code("3900")
                    .name("Accumulated Surplus / (Deficit)")
                    .amount(accumulatedSurplus)
                    .build());
        }

        BigDecimal totalNetAssets = totalEquityAccounts.add(accumulatedSurplus);
        BigDecimal totalLiabilitiesAndNetAssets = totalLiabilities.add(totalNetAssets);

        return BalanceSheetResponse.builder()
                .asOfDate(asOfDate)
                .assets(assets)
                .liabilities(liabilities)
                .netAssets(netAssets)
                .totalAssets(totalAssets)
                .totalLiabilities(totalLiabilities)
                .totalNetAssets(totalNetAssets)
                .totalLiabilitiesAndNetAssets(totalLiabilitiesAndNetAssets)
                .build();
    }

    @Transactional(readOnly = true)
    public CashFlowResponse getCashFlow(UserPrincipal principal, LocalDate from, LocalDate to) {
        Long organizationId = tenantSupport.organizationId(principal);
        LocalDate fromDate = resolveFromDate(from);
        LocalDate toDate = resolveToDate(to);

        List<AccountPeriodSummary> allTime = journalLineRepository.summarizeByAccount(
                organizationId, null, null, null);
        List<AccountPeriodSummary> inPeriod = journalLineRepository.summarizeByAccount(
                organizationId, fromDate, toDate, null);

        AccountPeriodSummary cashAllTime = findByCode(allTime, AccountCodes.CASH);
        AccountPeriodSummary cashBeforePeriod = findByCode(
                journalLineRepository.summarizeByAccount(
                        organizationId, null, fromDate.minusDays(1), null),
                AccountCodes.CASH);
        AccountPeriodSummary cashInPeriod = findByCode(inPeriod, AccountCodes.CASH);

        BigDecimal openingCash = cashBeforePeriod != null
                ? debitNormalBalance(cashBeforePeriod)
                : BigDecimal.ZERO;
        BigDecimal cashInflows = cashInPeriod != null ? cashInPeriod.getTotalDebits() : BigDecimal.ZERO;
        BigDecimal cashOutflows = cashInPeriod != null ? cashInPeriod.getTotalCredits() : BigDecimal.ZERO;
        BigDecimal closingCash = cashAllTime != null
                ? debitNormalBalance(cashAllTime)
                : openingCash.add(cashInflows).subtract(cashOutflows);

        return CashFlowResponse.builder()
                .fromDate(fromDate)
                .toDate(toDate)
                .openingCash(openingCash)
                .cashInflows(cashInflows)
                .cashOutflows(cashOutflows)
                .netCashChange(cashInflows.subtract(cashOutflows))
                .closingCash(closingCash)
                .build();
    }

    @Transactional(readOnly = true)
    public FundReportResponse getFundReport(
            UserPrincipal principal, LocalDate from, LocalDate to, Long fundId) {
        Long organizationId = tenantSupport.organizationId(principal);
        LocalDate fromDate = resolveFromDate(from);
        LocalDate toDate = resolveToDate(to);

        List<Fund> funds = fundId != null
                ? fundRepository.findByIdAndOrganizationIdAndDeletedFalse(fundId, organizationId)
                        .map(List::of)
                        .orElse(List.of())
                : fundRepository.findByOrganizationIdAndDeletedFalse(organizationId);

        List<FundReportLine> lines = new ArrayList<>();
        BigDecimal totalRevenue = BigDecimal.ZERO;
        BigDecimal totalExpenses = BigDecimal.ZERO;

        for (Fund fund : funds) {
            List<AccountPeriodSummary> summaries = journalLineRepository.summarizeByAccount(
                    organizationId, fromDate, toDate, fund.getId());

            BigDecimal revenue = BigDecimal.ZERO;
            BigDecimal expenses = BigDecimal.ZERO;

            for (AccountPeriodSummary summary : summaries) {
                if (summary.getAccountType() == AccountType.REVENUE) {
                    revenue = revenue.add(creditNormalBalance(summary));
                } else if (summary.getAccountType() == AccountType.EXPENSE) {
                    expenses = expenses.add(debitNormalBalance(summary));
                }
            }

            BigDecimal netActivity = revenue.subtract(expenses);
            BigDecimal operationalBalance = fundBalanceService.calculateBalance(fund.getId(), organizationId);

            lines.add(FundReportLine.builder()
                    .fundId(fund.getId())
                    .fundCode(fund.getCode())
                    .fundName(fund.getName())
                    .fundType(fund.getType())
                    .revenue(revenue)
                    .expenses(expenses)
                    .netActivity(netActivity)
                    .operationalBalance(operationalBalance)
                    .build());

            totalRevenue = totalRevenue.add(revenue);
            totalExpenses = totalExpenses.add(expenses);
        }

        lines.sort(Comparator.comparing(FundReportLine::getFundCode));

        return FundReportResponse.builder()
                .fromDate(fromDate)
                .toDate(toDate)
                .funds(lines)
                .totalRevenue(totalRevenue)
                .totalExpenses(totalExpenses)
                .totalNetActivity(totalRevenue.subtract(totalExpenses))
                .build();
    }

    @Transactional(readOnly = true)
    public BudgetReportResponse getBudgetReport(UserPrincipal principal, LocalDate from, LocalDate to) {
        LocalDate fromDate = resolveFromDate(from);
        LocalDate toDate = resolveToDate(to);

        BudgetVarianceResponse variance = budgetService.getActiveOrganizationVariance(principal, fromDate, toDate);
        if (variance != null) {
            List<BudgetReportLine> lines = variance.getLines().stream()
                    .map(this::toBudgetReportLine)
                    .toList();

            return BudgetReportResponse.builder()
                    .fromDate(variance.getFromDate())
                    .toDate(variance.getToDate())
                    .lines(lines)
                    .totalBudget(variance.getTotalBudget())
                    .totalActual(variance.getTotalActual())
                    .totalVariance(variance.getTotalVariance())
                    .note(null)
                    .build();
        }

        return buildActualsOnlyBudgetReport(principal, fromDate, toDate);
    }

    private BudgetReportResponse buildActualsOnlyBudgetReport(
            UserPrincipal principal, LocalDate fromDate, LocalDate toDate) {
        Long organizationId = tenantSupport.organizationId(principal);

        List<AccountPeriodSummary> summaries = journalLineRepository.summarizeByAccount(
                organizationId, fromDate, toDate, null);

        List<BudgetReportLine> lines = new ArrayList<>();
        BigDecimal totalActual = BigDecimal.ZERO;

        for (AccountPeriodSummary summary : summaries) {
            if (summary.getAccountType() != AccountType.EXPENSE) {
                continue;
            }

            BigDecimal actual = debitNormalBalance(summary);
            if (actual.compareTo(BigDecimal.ZERO) == 0) {
                continue;
            }

            lines.add(BudgetReportLine.builder()
                    .accountCode(summary.getAccountCode())
                    .accountName(summary.getAccountName())
                    .budgetAmount(BigDecimal.ZERO)
                    .actualAmount(actual)
                    .variance(BigDecimal.ZERO.subtract(actual))
                    .build());
            totalActual = totalActual.add(actual);
        }

        lines.sort(Comparator.comparing(BudgetReportLine::getAccountCode));

        return BudgetReportResponse.builder()
                .fromDate(fromDate)
                .toDate(toDate)
                .lines(lines)
                .totalBudget(BigDecimal.ZERO)
                .totalActual(totalActual)
                .totalVariance(BigDecimal.ZERO.subtract(totalActual))
                .note(NO_ACTIVE_BUDGET_NOTE)
                .build();
    }

    private BudgetReportLine toBudgetReportLine(BudgetVarianceLine line) {
        return BudgetReportLine.builder()
                .accountCode(BudgetService.accountCodeFor(line.getCategory()))
                .accountName(categoryLabel(line.getCategory()))
                .budgetAmount(line.getBudgetAmount())
                .actualAmount(line.getActualAmount())
                .variance(line.getVariance())
                .build();
    }

    private String categoryLabel(ExpenseCategory category) {
        return switch (category) {
            case OPERATIONS -> "Operations Expense";
            case PROGRAM -> "Program Expense";
            case ADMINISTRATIVE -> "Administrative Expense";
            case FUNDRAISING -> "Fundraising Expense";
            case MISCELLANEOUS -> "Miscellaneous Expense";
        };
    }

    private LocalDate resolveFromDate(LocalDate from) {
        return from != null ? from : LocalDate.of(LocalDate.now().getYear(), 1, 1);
    }

    private LocalDate resolveToDate(LocalDate to) {
        return to != null ? to : LocalDate.now();
    }

    private BigDecimal debitNormalBalance(AccountPeriodSummary summary) {
        return summary.getTotalDebits().subtract(summary.getTotalCredits());
    }

    private BigDecimal creditNormalBalance(AccountPeriodSummary summary) {
        return summary.getTotalCredits().subtract(summary.getTotalDebits());
    }

    private ReportLineItem lineItem(AccountPeriodSummary summary, BigDecimal amount) {
        return ReportLineItem.builder()
                .code(summary.getAccountCode())
                .name(summary.getAccountName())
                .amount(amount)
                .build();
    }

    private AccountPeriodSummary findByCode(List<AccountPeriodSummary> summaries, String code) {
        return summaries.stream()
                .filter(s -> code.equals(s.getAccountCode()))
                .findFirst()
                .orElse(null);
    }
}
