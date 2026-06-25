package com.project.daisyDonation.analytics.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.project.daisyDonation.accounting.entity.ChartOfAccount;
import com.project.daisyDonation.accounting.repository.ChartOfAccountRepository;
import com.project.daisyDonation.accounting.repository.JournalLineRepository;
import com.project.daisyDonation.accounting.service.AccountCodes;
import com.project.daisyDonation.analytics.dto.CampaignPerformanceLine;
import com.project.daisyDonation.analytics.dto.ExecutiveDashboardResponse;
import com.project.daisyDonation.analytics.dto.ForecastPoint;
import com.project.daisyDonation.analytics.dto.ForecastResponse;
import com.project.daisyDonation.analytics.dto.InsightItem;
import com.project.daisyDonation.analytics.dto.InsightSeverity;
import com.project.daisyDonation.analytics.dto.InsightsResponse;
import com.project.daisyDonation.analytics.dto.SourceBreakdown;
import com.project.daisyDonation.analytics.dto.TrendAnalysisResponse;
import com.project.daisyDonation.analytics.dto.TrendPoint;
import com.project.daisyDonation.budget.dto.BudgetVarianceResponse;
import com.project.daisyDonation.budget.service.BudgetService;
import com.project.daisyDonation.campaign.entity.Campaign;
import com.project.daisyDonation.campaign.entity.CampaignStatus;
import com.project.daisyDonation.campaign.repository.CampaignRepository;
import com.project.daisyDonation.common.security.UserPrincipal;
import com.project.daisyDonation.common.service.TenantSupport;
import com.project.daisyDonation.donation.entity.Donation;
import com.project.daisyDonation.donation.repository.DonationRepository;
import com.project.daisyDonation.expense.entity.Expense;
import com.project.daisyDonation.expense.entity.ExpenseStatus;
import com.project.daisyDonation.expense.repository.ExpenseRepository;
import com.project.daisyDonation.fund.entity.Fund;
import com.project.daisyDonation.fund.repository.FundRepository;
import com.project.daisyDonation.fund.service.FundBalanceService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private static final DateTimeFormatter MONTH_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM");
    private static final int DEFAULT_FORECAST_MONTHS = 3;
    private static final int DEFAULT_HISTORY_MONTHS = 6;

    private final TenantSupport tenantSupport;
    private final DonationRepository donationRepository;
    private final ExpenseRepository expenseRepository;
    private final CampaignRepository campaignRepository;
    private final FundRepository fundRepository;
    private final FundBalanceService fundBalanceService;
    private final JournalLineRepository journalLineRepository;
    private final ChartOfAccountRepository chartOfAccountRepository;
    private final BudgetService budgetService;

    @Transactional(readOnly = true)
    public ExecutiveDashboardResponse getExecutiveDashboard(
            UserPrincipal principal, LocalDate from, LocalDate to) {
        Long organizationId = tenantSupport.organizationId(principal);
        LocalDate fromDate = resolveFromDate(from);
        LocalDate toDate = resolveToDate(to);
        LocalDateTime fromDateTime = fromDate.atStartOfDay();
        LocalDateTime toDateTime = toDate.atTime(23, 59, 59);

        BigDecimal totalDonations = donationRepository.sumCompletedAmountInPeriod(
                organizationId, fromDateTime, toDateTime);
        BigDecimal totalExpenses = expenseRepository.sumPaidAmountInPeriod(
                organizationId, fromDateTime, toDateTime);

        long donorCount = donationRepository.countDistinctDonorsInPeriod(
                organizationId, fromDateTime, toDateTime);
        long donationCount = donationRepository.findCompletedInPeriod(
                organizationId, fromDateTime, toDateTime).size();

        BigDecimal averageDonation = donationCount > 0
                ? totalDonations.divide(BigDecimal.valueOf(donationCount), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        long periodDays = ChronoUnit.DAYS.between(fromDate, toDate) + 1;
        LocalDate priorTo = fromDate.minusDays(1);
        LocalDate priorFrom = priorTo.minusDays(periodDays - 1);
        BigDecimal priorDonations = donationRepository.sumCompletedAmountInPeriod(
                organizationId, priorFrom.atStartOfDay(), priorTo.atTime(23, 59, 59));
        BigDecimal priorExpenses = expenseRepository.sumPaidAmountInPeriod(
                organizationId, priorFrom.atStartOfDay(), priorTo.atTime(23, 59, 59));

        long activeCampaignCount = campaignRepository
                .findByOrganizationIdAndStatusAndDeletedFalse(organizationId, CampaignStatus.ACTIVE)
                .size();

        BigDecimal budgetUtilization = resolveBudgetUtilization(principal, fromDate, toDate);
        long pendingExpenseCount = expenseRepository.countByStatus(organizationId, ExpenseStatus.SUBMITTED)
                + expenseRepository.countByStatus(organizationId, ExpenseStatus.APPROVED);

        return ExecutiveDashboardResponse.builder()
                .fromDate(fromDate)
                .toDate(toDate)
                .totalDonations(totalDonations)
                .totalExpenses(totalExpenses)
                .netPosition(totalDonations.subtract(totalExpenses))
                .cashBalance(resolveCashBalance(organizationId))
                .totalFundBalance(resolveTotalFundBalance(organizationId))
                .donationGrowthPercent(growthPercent(totalDonations, priorDonations))
                .expenseGrowthPercent(growthPercent(totalExpenses, priorExpenses))
                .donorCount(donorCount)
                .averageDonation(averageDonation)
                .activeCampaignCount(activeCampaignCount)
                .budgetUtilizationPercent(budgetUtilization)
                .pendingExpenseCount(pendingExpenseCount)
                .build();
    }

    @Transactional(readOnly = true)
    public TrendAnalysisResponse getTrendAnalysis(
            UserPrincipal principal, LocalDate from, LocalDate to) {
        Long organizationId = tenantSupport.organizationId(principal);
        LocalDate fromDate = resolveFromDate(from);
        LocalDate toDate = resolveToDate(to);
        LocalDateTime fromDateTime = fromDate.atStartOfDay();
        LocalDateTime toDateTime = toDate.atTime(23, 59, 59);

        List<Donation> donations = donationRepository.findCompletedInPeriod(
                organizationId, fromDateTime, toDateTime);
        List<Expense> expenses = expenseRepository.findPaidInPeriod(
                organizationId, fromDateTime, toDateTime);

        return TrendAnalysisResponse.builder()
                .fromDate(fromDate)
                .toDate(toDate)
                .granularity("MONTHLY")
                .donationTrend(buildDonationTrend(donations, fromDate, toDate))
                .expenseTrend(buildExpenseTrend(expenses, fromDate, toDate))
                .donationSources(buildDonationSources(donations))
                .campaignPerformance(buildCampaignPerformance(organizationId, donations))
                .build();
    }

    @Transactional(readOnly = true)
    public ForecastResponse getForecast(UserPrincipal principal, Integer monthsAhead) {
        Long organizationId = tenantSupport.organizationId(principal);
        int forecastMonths = monthsAhead != null && monthsAhead > 0
                ? Math.min(monthsAhead, 12)
                : DEFAULT_FORECAST_MONTHS;

        YearMonth endMonth = YearMonth.from(LocalDate.now());
        YearMonth startMonth = endMonth.minusMonths(DEFAULT_HISTORY_MONTHS - 1L);

        LocalDateTime fromDateTime = startMonth.atDay(1).atStartOfDay();
        LocalDateTime toDateTime = endMonth.atEndOfMonth().atTime(23, 59, 59);

        List<Donation> donations = donationRepository.findCompletedInPeriod(
                organizationId, fromDateTime, toDateTime);
        List<Expense> expenses = expenseRepository.findPaidInPeriod(
                organizationId, fromDateTime, toDateTime);

        Map<YearMonth, BigDecimal> donationByMonth = groupDonationsByMonth(donations);
        Map<YearMonth, BigDecimal> expenseByMonth = groupExpensesByMonth(expenses);

        List<YearMonth> historyMonths = monthRange(startMonth, endMonth);
        List<BigDecimal> donationHistory = historyMonths.stream()
                .map(month -> donationByMonth.getOrDefault(month, BigDecimal.ZERO))
                .toList();
        List<BigDecimal> expenseHistory = historyMonths.stream()
                .map(month -> expenseByMonth.getOrDefault(month, BigDecimal.ZERO))
                .toList();

        BigDecimal donationSlope = averageMonthlyChange(donationHistory);
        BigDecimal expenseSlope = averageMonthlyChange(expenseHistory);
        BigDecimal lastDonation = donationHistory.isEmpty()
                ? BigDecimal.ZERO
                : donationHistory.get(donationHistory.size() - 1);
        BigDecimal lastExpense = expenseHistory.isEmpty()
                ? BigDecimal.ZERO
                : expenseHistory.get(expenseHistory.size() - 1);

        List<ForecastPoint> projections = new ArrayList<>();
        for (int i = 1; i <= forecastMonths; i++) {
            YearMonth projectedMonth = endMonth.plusMonths(i);
            BigDecimal projectedDonations = lastDonation.add(donationSlope.multiply(BigDecimal.valueOf(i)))
                    .max(BigDecimal.ZERO)
                    .setScale(2, RoundingMode.HALF_UP);
            BigDecimal projectedExpenses = lastExpense.add(expenseSlope.multiply(BigDecimal.valueOf(i)))
                    .max(BigDecimal.ZERO)
                    .setScale(2, RoundingMode.HALF_UP);

            projections.add(ForecastPoint.builder()
                    .period(projectedMonth.format(MONTH_FORMAT))
                    .projectedDonations(projectedDonations)
                    .projectedExpenses(projectedExpenses)
                    .projectedNet(projectedDonations.subtract(projectedExpenses))
                    .build());
        }

        return ForecastResponse.builder()
                .basedOnMonths(DEFAULT_HISTORY_MONTHS)
                .forecastMonths(forecastMonths)
                .projections(projections)
                .methodology("Linear trend projection from the last "
                        + DEFAULT_HISTORY_MONTHS + " months of activity")
                .build();
    }

    @Transactional(readOnly = true)
    public InsightsResponse getInsights(UserPrincipal principal) {
        Long organizationId = tenantSupport.organizationId(principal);
        List<InsightItem> insights = new ArrayList<>();

        LocalDate toDate = LocalDate.now();
        LocalDate fromDate = toDate.minusMonths(2);
        LocalDate priorFrom = fromDate.minusMonths(1);

        LocalDateTime currentFrom = fromDate.atStartOfDay();
        LocalDateTime currentTo = toDate.atTime(23, 59, 59);
        LocalDateTime priorFromTime = priorFrom.atStartOfDay();
        LocalDateTime priorToTime = fromDate.minusDays(1).atTime(23, 59, 59);

        BigDecimal recentDonations = donationRepository.sumCompletedAmountInPeriod(
                organizationId, currentFrom, currentTo);
        BigDecimal priorDonations = donationRepository.sumCompletedAmountInPeriod(
                organizationId, priorFromTime, priorToTime);
        BigDecimal donationGrowth = growthPercent(recentDonations, priorDonations);

        if (donationGrowth.compareTo(BigDecimal.valueOf(-10)) < 0) {
            insights.add(InsightItem.builder()
                    .category("FUNDRAISING")
                    .severity(InsightSeverity.WARNING)
                    .title("Donation decline detected")
                    .message("Donations declined " + donationGrowth.abs()
                            + "% compared to the prior month. Review outreach and campaign activity.")
                    .build());
        } else if (donationGrowth.compareTo(BigDecimal.valueOf(15)) > 0) {
            insights.add(InsightItem.builder()
                    .category("FUNDRAISING")
                    .severity(InsightSeverity.INFO)
                    .title("Strong donation growth")
                    .message("Donations grew " + donationGrowth
                            + "% compared to the prior month.")
                    .build());
        }

        BigDecimal budgetUtilization = resolveBudgetUtilization(principal, fromDate, toDate);
        if (budgetUtilization != null) {
            if (budgetUtilization.compareTo(BigDecimal.valueOf(90)) >= 0) {
                insights.add(InsightItem.builder()
                        .category("BUDGET")
                        .severity(InsightSeverity.WARNING)
                        .title("High budget utilization")
                        .message("Organization budget is " + budgetUtilization
                                + "% utilized. Monitor remaining allocations closely.")
                        .build());
            } else if (budgetUtilization.compareTo(BigDecimal.valueOf(50)) < 0
                    && toDate.getMonthValue() >= 6) {
                insights.add(InsightItem.builder()
                        .category("BUDGET")
                        .severity(InsightSeverity.INFO)
                        .title("Under-spending trend")
                        .message("Budget utilization is " + budgetUtilization
                                + "% mid-year. Programs may be under-delivering against plan.")
                        .build());
            }
        }

        BigDecimal cashBalance = resolveCashBalance(organizationId);
        BigDecimal monthlyExpenses = expenseRepository.sumPaidAmountInPeriod(
                organizationId,
                toDate.minusMonths(1).atStartOfDay(),
                toDate.atTime(23, 59, 59));
        if (monthlyExpenses.compareTo(BigDecimal.ZERO) > 0
                && cashBalance.compareTo(monthlyExpenses) < 0) {
            insights.add(InsightItem.builder()
                    .category("LIQUIDITY")
                    .severity(InsightSeverity.CRITICAL)
                    .title("Low cash runway")
                    .message("Cash balance (" + cashBalance
                            + ") is below one month of recent expenses (" + monthlyExpenses + ").")
                    .build());
        }

        long pendingExpenses = expenseRepository.countByStatus(organizationId, ExpenseStatus.SUBMITTED)
                + expenseRepository.countByStatus(organizationId, ExpenseStatus.APPROVED);
        if (pendingExpenses > 0) {
            insights.add(InsightItem.builder()
                    .category("OPERATIONS")
                    .severity(InsightSeverity.INFO)
                    .title("Pending expense approvals")
                    .message(pendingExpenses + " expense(s) await approval or payment.")
                    .build());
        }

        List<Campaign> activeCampaigns = campaignRepository
                .findByOrganizationIdAndStatusAndDeletedFalse(organizationId, CampaignStatus.ACTIVE);
        for (Campaign campaign : activeCampaigns) {
            if (campaign.getTargetAmount() == null
                    || campaign.getTargetAmount().compareTo(BigDecimal.ZERO) <= 0) {
                continue;
            }
            BigDecimal raised = donationRepository.sumCompletedAmountByCampaign(
                    campaign.getId(), organizationId);
            BigDecimal goalPercent = raised.multiply(BigDecimal.valueOf(100))
                    .divide(campaign.getTargetAmount(), 2, RoundingMode.HALF_UP);

            if (campaign.getEndDate() != null
                    && !campaign.getEndDate().isAfter(toDate.plusMonths(1))
                    && goalPercent.compareTo(BigDecimal.valueOf(50)) < 0) {
                insights.add(InsightItem.builder()
                        .category("CAMPAIGN")
                        .severity(InsightSeverity.WARNING)
                        .title("Campaign at risk")
                        .message("Campaign \"" + campaign.getName() + "\" is at "
                                + goalPercent + "% of goal with end date approaching.")
                        .build());
            }
        }

        if (insights.isEmpty()) {
            insights.add(InsightItem.builder()
                    .category("GENERAL")
                    .severity(InsightSeverity.INFO)
                    .title("Operations stable")
                    .message("No significant anomalies detected in recent financial activity.")
                    .build());
        }

        return InsightsResponse.builder()
                .insights(insights.stream()
                        .sorted(Comparator.comparing(InsightItem::getSeverity))
                        .toList())
                .build();
    }

    private BigDecimal resolveCashBalance(Long organizationId) {
        return chartOfAccountRepository
                .findByOrganizationIdAndCodeAndDeletedFalse(organizationId, AccountCodes.CASH)
                .map(account -> cashBalance(organizationId, account))
                .orElse(BigDecimal.ZERO);
    }

    private BigDecimal cashBalance(Long organizationId, ChartOfAccount account) {
        BigDecimal debits = journalLineRepository.sumDebitsByAccount(organizationId, account.getId());
        BigDecimal credits = journalLineRepository.sumCreditsByAccount(organizationId, account.getId());
        return debits.subtract(credits);
    }

    private BigDecimal resolveTotalFundBalance(Long organizationId) {
        return fundRepository.findByOrganizationIdAndDeletedFalse(organizationId).stream()
                .map(Fund::getId)
                .map(fundId -> fundBalanceService.calculateBalance(fundId, organizationId))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BigDecimal resolveBudgetUtilization(UserPrincipal principal, LocalDate from, LocalDate to) {
        BudgetVarianceResponse variance = budgetService.getActiveOrganizationVariance(principal, from, to);
        if (variance == null
                || variance.getTotalBudget() == null
                || variance.getTotalBudget().compareTo(BigDecimal.ZERO) <= 0) {
            return null;
        }
        return variance.getTotalActual()
                .multiply(BigDecimal.valueOf(100))
                .divide(variance.getTotalBudget(), 2, RoundingMode.HALF_UP);
    }

    private List<TrendPoint> buildDonationTrend(
            List<Donation> donations, LocalDate fromDate, LocalDate toDate) {
        Map<YearMonth, TrendAccumulator> buckets = initMonthlyBuckets(fromDate, toDate);
        for (Donation donation : donations) {
            if (donation.getDonationTime() == null) {
                continue;
            }
            YearMonth month = YearMonth.from(donation.getDonationTime());
            TrendAccumulator bucket = buckets.get(month);
            if (bucket != null) {
                bucket.add(donation.getAmount());
            }
        }
        return toTrendPoints(buckets);
    }

    private List<TrendPoint> buildExpenseTrend(
            List<Expense> expenses, LocalDate fromDate, LocalDate toDate) {
        Map<YearMonth, TrendAccumulator> buckets = initMonthlyBuckets(fromDate, toDate);
        for (Expense expense : expenses) {
            if (expense.getPaidAt() == null) {
                continue;
            }
            YearMonth month = YearMonth.from(expense.getPaidAt());
            TrendAccumulator bucket = buckets.get(month);
            if (bucket != null) {
                bucket.add(expense.getAmount());
            }
        }
        return toTrendPoints(buckets);
    }

    private List<SourceBreakdown> buildDonationSources(List<Donation> donations) {
        Map<String, SourceAccumulator> sources = new HashMap<>();
        BigDecimal total = BigDecimal.ZERO;

        for (Donation donation : donations) {
            String source = donation.getSource() != null && !donation.getSource().isBlank()
                    ? donation.getSource()
                    : donation.getDonationType().name();
            SourceAccumulator accumulator = sources.computeIfAbsent(source, key -> new SourceAccumulator());
            accumulator.add(donation.getAmount());
            total = total.add(donation.getAmount());
        }

        BigDecimal finalTotal = total;
        return sources.entrySet().stream()
                .map(entry -> {
                    BigDecimal share = finalTotal.compareTo(BigDecimal.ZERO) > 0
                            ? entry.getValue().amount.multiply(BigDecimal.valueOf(100))
                                    .divide(finalTotal, 2, RoundingMode.HALF_UP)
                            : BigDecimal.ZERO;
                    return SourceBreakdown.builder()
                            .source(entry.getKey())
                            .amount(entry.getValue().amount)
                            .count(entry.getValue().count)
                            .sharePercent(share)
                            .build();
                })
                .sorted(Comparator.comparing(SourceBreakdown::getAmount).reversed())
                .toList();
    }

    private List<CampaignPerformanceLine> buildCampaignPerformance(
            Long organizationId, List<Donation> donations) {
        Map<Long, CampaignAccumulator> byCampaign = new LinkedHashMap<>();

        for (Donation donation : donations) {
            if (donation.getCampaign() == null) {
                continue;
            }
            Long campaignId = donation.getCampaign().getId();
            CampaignAccumulator accumulator = byCampaign.computeIfAbsent(
                    campaignId, id -> new CampaignAccumulator());
            accumulator.add(donation.getAmount());
        }

        return campaignRepository.findByOrganizationIdAndDeletedFalse(organizationId).stream()
                .map(campaign -> {
                    CampaignAccumulator accumulator = byCampaign.get(campaign.getId());
                    BigDecimal raised = accumulator != null
                            ? accumulator.raised
                            : donationRepository.sumCompletedAmountByCampaign(campaign.getId(), organizationId);
                    long count = accumulator != null
                            ? accumulator.count
                            : donationRepository.countCompletedByCampaign(campaign.getId(), organizationId);
                    BigDecimal goalPercent = campaign.getTargetAmount() != null
                            && campaign.getTargetAmount().compareTo(BigDecimal.ZERO) > 0
                            ? raised.multiply(BigDecimal.valueOf(100))
                                    .divide(campaign.getTargetAmount(), 2, RoundingMode.HALF_UP)
                            : null;

                    return CampaignPerformanceLine.builder()
                            .campaignId(campaign.getId())
                            .campaignName(campaign.getName())
                            .raisedAmount(raised)
                            .targetAmount(campaign.getTargetAmount())
                            .goalPercent(goalPercent)
                            .donationCount(count)
                            .build();
                })
                .sorted(Comparator.comparing(CampaignPerformanceLine::getRaisedAmount).reversed())
                .collect(Collectors.toList());
    }

    private Map<YearMonth, BigDecimal> groupDonationsByMonth(List<Donation> donations) {
        Map<YearMonth, BigDecimal> grouped = new TreeMap<>();
        for (Donation donation : donations) {
            if (donation.getDonationTime() == null) {
                continue;
            }
            YearMonth month = YearMonth.from(donation.getDonationTime());
            grouped.merge(month, donation.getAmount(), BigDecimal::add);
        }
        return grouped;
    }

    private Map<YearMonth, BigDecimal> groupExpensesByMonth(List<Expense> expenses) {
        Map<YearMonth, BigDecimal> grouped = new TreeMap<>();
        for (Expense expense : expenses) {
            if (expense.getPaidAt() == null) {
                continue;
            }
            YearMonth month = YearMonth.from(expense.getPaidAt());
            grouped.merge(month, expense.getAmount(), BigDecimal::add);
        }
        return grouped;
    }

    private BigDecimal averageMonthlyChange(List<BigDecimal> values) {
        if (values.size() < 2) {
            return BigDecimal.ZERO;
        }
        BigDecimal totalChange = BigDecimal.ZERO;
        for (int i = 1; i < values.size(); i++) {
            totalChange = totalChange.add(values.get(i).subtract(values.get(i - 1)));
        }
        return totalChange.divide(BigDecimal.valueOf(values.size() - 1), 4, RoundingMode.HALF_UP);
    }

    private List<YearMonth> monthRange(YearMonth start, YearMonth end) {
        List<YearMonth> months = new ArrayList<>();
        YearMonth cursor = start;
        while (!cursor.isAfter(end)) {
            months.add(cursor);
            cursor = cursor.plusMonths(1);
        }
        return months;
    }

    private Map<YearMonth, TrendAccumulator> initMonthlyBuckets(LocalDate fromDate, LocalDate toDate) {
        Map<YearMonth, TrendAccumulator> buckets = new LinkedHashMap<>();
        YearMonth start = YearMonth.from(fromDate);
        YearMonth end = YearMonth.from(toDate);
        YearMonth cursor = start;
        while (!cursor.isAfter(end)) {
            buckets.put(cursor, new TrendAccumulator());
            cursor = cursor.plusMonths(1);
        }
        return buckets;
    }

    private List<TrendPoint> toTrendPoints(Map<YearMonth, TrendAccumulator> buckets) {
        return buckets.entrySet().stream()
                .map(entry -> TrendPoint.builder()
                        .period(entry.getKey().format(MONTH_FORMAT))
                        .amount(entry.getValue().amount)
                        .count(entry.getValue().count)
                        .build())
                .toList();
    }

    private BigDecimal growthPercent(BigDecimal current, BigDecimal prior) {
        if (prior.compareTo(BigDecimal.ZERO) == 0) {
            return current.compareTo(BigDecimal.ZERO) > 0 ? BigDecimal.valueOf(100) : BigDecimal.ZERO;
        }
        return current.subtract(prior)
                .multiply(BigDecimal.valueOf(100))
                .divide(prior, 2, RoundingMode.HALF_UP);
    }

    private LocalDate resolveFromDate(LocalDate from) {
        return from != null ? from : LocalDate.of(LocalDate.now().getYear(), 1, 1);
    }

    private LocalDate resolveToDate(LocalDate to) {
        return to != null ? to : LocalDate.now();
    }

    private static final class TrendAccumulator {
        private BigDecimal amount = BigDecimal.ZERO;
        private long count;

        private void add(BigDecimal value) {
            amount = amount.add(value);
            count++;
        }
    }

    private static final class SourceAccumulator {
        private BigDecimal amount = BigDecimal.ZERO;
        private long count;

        private void add(BigDecimal value) {
            amount = amount.add(value);
            count++;
        }
    }

    private static final class CampaignAccumulator {
        private BigDecimal raised = BigDecimal.ZERO;
        private long count;

        private void add(BigDecimal value) {
            raised = raised.add(value);
            count++;
        }
    }
}
