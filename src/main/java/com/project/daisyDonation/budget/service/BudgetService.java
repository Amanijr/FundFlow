package com.project.daisyDonation.budget.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.project.daisyDonation.accounting.service.AccountCodes;
import com.project.daisyDonation.budget.dto.BudgetLineRequest;
import com.project.daisyDonation.budget.dto.BudgetLineResponse;
import com.project.daisyDonation.budget.dto.BudgetRequest;
import com.project.daisyDonation.budget.dto.BudgetResponse;
import com.project.daisyDonation.budget.dto.BudgetVarianceLine;
import com.project.daisyDonation.budget.dto.BudgetVarianceResponse;
import com.project.daisyDonation.budget.entity.Budget;
import com.project.daisyDonation.budget.entity.BudgetLine;
import com.project.daisyDonation.budget.entity.BudgetScopeType;
import com.project.daisyDonation.budget.entity.BudgetStatus;
import com.project.daisyDonation.budget.repository.BudgetLineRepository;
import com.project.daisyDonation.budget.repository.BudgetRepository;
import com.project.daisyDonation.campaign.entity.Campaign;
import com.project.daisyDonation.campaign.service.CampaignService;
import com.project.daisyDonation.common.exception.BadRequestException;
import com.project.daisyDonation.common.exception.ResourceNotFoundException;
import com.project.daisyDonation.common.security.UserPrincipal;
import com.project.daisyDonation.common.service.TenantSupport;
import com.project.daisyDonation.expense.entity.ExpenseCategory;
import com.project.daisyDonation.expense.repository.ExpenseRepository;
import com.project.daisyDonation.fund.entity.Fund;
import com.project.daisyDonation.fund.service.FundService;
import com.project.daisyDonation.organization.entity.Organization;
import com.project.daisyDonation.program.entity.Program;
import com.project.daisyDonation.program.service.ProgramService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final BudgetLineRepository budgetLineRepository;
    private final ExpenseRepository expenseRepository;
    private final TenantSupport tenantSupport;
    private final FundService fundService;
    private final CampaignService campaignService;
    private final ProgramService programService;

    @Transactional
    public BudgetResponse create(UserPrincipal principal, BudgetRequest request) {
        Organization organization = tenantSupport.organization(principal);
        validateBudgetRequest(request);

        Budget budget = new Budget();
        budget.setOrganization(organization);
        applyRequest(principal, budget, request);

        return toResponse(budgetRepository.save(budget));
    }

    @Transactional(readOnly = true)
    public List<BudgetResponse> list(UserPrincipal principal) {
        Long organizationId = tenantSupport.organizationId(principal);
        return budgetRepository.findByOrganizationIdAndDeletedFalse(organizationId).stream()
                .sorted(Comparator.comparing(Budget::getFiscalYear).reversed()
                        .thenComparing(Budget::getName))
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public BudgetResponse getById(UserPrincipal principal, Long budgetId) {
        return toResponse(requireBudget(principal, budgetId));
    }

    @Transactional
    public BudgetResponse update(UserPrincipal principal, Long budgetId, BudgetRequest request) {
        Budget budget = requireBudget(principal, budgetId);
        ensureDraft(budget);
        validateBudgetRequest(request);
        applyRequest(principal, budget, request);
        return toResponse(budgetRepository.save(budget));
    }

    @Transactional
    public BudgetLineResponse addLine(UserPrincipal principal, Long budgetId, BudgetLineRequest request) {
        Budget budget = requireBudget(principal, budgetId);
        ensureDraft(budget);

        BudgetLine line = new BudgetLine();
        line.setBudget(budget);
        applyLineRequest(principal, line, request);

        return toLineResponse(budgetLineRepository.save(line));
    }

    @Transactional
    public BudgetLineResponse updateLine(
            UserPrincipal principal, Long budgetId, Long lineId, BudgetLineRequest request) {
        Budget budget = requireBudget(principal, budgetId);
        ensureDraft(budget);

        BudgetLine line = requireLine(budgetId, lineId);
        applyLineRequest(principal, line, request);

        return toLineResponse(budgetLineRepository.save(line));
    }

    @Transactional
    public void deleteLine(UserPrincipal principal, Long budgetId, Long lineId) {
        Budget budget = requireBudget(principal, budgetId);
        ensureDraft(budget);

        BudgetLine line = requireLine(budgetId, lineId);
        line.setDeleted(true);
        budgetLineRepository.save(line);
    }

    @Transactional
    public BudgetResponse approve(UserPrincipal principal, Long budgetId) {
        Budget budget = requireBudget(principal, budgetId);

        if (budget.getStatus() != BudgetStatus.DRAFT) {
            throw new BadRequestException("Only draft budgets can be approved");
        }

        if (budgetLineRepository.findByBudgetIdAndDeletedFalse(budgetId).isEmpty()) {
            throw new BadRequestException("Budget must have at least one line before approval");
        }

        budget.setStatus(BudgetStatus.APPROVED);
        return toResponse(budgetRepository.save(budget));
    }

    @Transactional
    public BudgetResponse activate(UserPrincipal principal, Long budgetId) {
        Budget budget = requireBudget(principal, budgetId);

        if (budget.getStatus() != BudgetStatus.APPROVED) {
            throw new BadRequestException("Only approved budgets can be activated");
        }

        deactivateConflictingActiveBudgets(budget);
        budget.setStatus(BudgetStatus.ACTIVE);
        return toResponse(budgetRepository.save(budget));
    }

    @Transactional
    public BudgetResponse close(UserPrincipal principal, Long budgetId) {
        Budget budget = requireBudget(principal, budgetId);

        if (budget.getStatus() != BudgetStatus.ACTIVE) {
            throw new BadRequestException("Only active budgets can be closed");
        }

        budget.setStatus(BudgetStatus.CLOSED);
        return toResponse(budgetRepository.save(budget));
    }

    @Transactional(readOnly = true)
    public BudgetVarianceResponse getVariance(
            UserPrincipal principal, Long budgetId, LocalDate from, LocalDate to) {
        Budget budget = requireBudget(principal, budgetId);
        LocalDate fromDate = from != null ? from : budget.getStartDate();
        LocalDate toDate = to != null ? to : budget.getEndDate();
        return buildVariance(budget, fromDate, toDate);
    }

    @Transactional(readOnly = true)
    public BudgetVarianceResponse getActiveOrganizationVariance(
            UserPrincipal principal, LocalDate from, LocalDate to) {
        Long organizationId = tenantSupport.organizationId(principal);
        int fiscalYear = (from != null ? from : LocalDate.now()).getYear();

        Budget activeBudget = budgetRepository
                .findByOrganizationIdAndFiscalYearAndStatusAndDeletedFalse(
                        organizationId, fiscalYear, BudgetStatus.ACTIVE)
                .stream()
                .filter(b -> b.getScopeType() == BudgetScopeType.ORGANIZATION)
                .findFirst()
                .orElse(null);

        if (activeBudget == null) {
            return null;
        }

        LocalDate fromDate = from != null ? from : activeBudget.getStartDate();
        LocalDate toDate = to != null ? to : activeBudget.getEndDate();
        return buildVariance(activeBudget, fromDate, toDate);
    }

    public static String accountCodeFor(ExpenseCategory category) {
        return switch (category) {
            case OPERATIONS -> AccountCodes.OPERATIONS_EXPENSE;
            case PROGRAM -> AccountCodes.PROGRAM_EXPENSE;
            case ADMINISTRATIVE -> AccountCodes.ADMINISTRATIVE_EXPENSE;
            case FUNDRAISING -> AccountCodes.FUNDRAISING_EXPENSE;
            case MISCELLANEOUS -> AccountCodes.MISCELLANEOUS_EXPENSE;
        };
    }

    private BudgetVarianceResponse buildVariance(Budget budget, LocalDate fromDate, LocalDate toDate) {
        Long organizationId = budget.getOrganization().getId();
        LocalDateTime fromDateTime = fromDate.atStartOfDay();
        LocalDateTime toDateTime = toDate.atTime(23, 59, 59);

        List<BudgetVarianceLine> lines = new ArrayList<>();
        BigDecimal totalBudget = BigDecimal.ZERO;
        BigDecimal totalActual = BigDecimal.ZERO;

        for (BudgetLine line : budgetLineRepository.findByBudgetIdAndDeletedFalse(budget.getId())) {
            String department = resolveDepartment(budget, line);
            Long fundId = line.getFund() != null ? line.getFund().getId() : null;

            BigDecimal actual = expenseRepository.sumPaidAmountInPeriod(
                    organizationId,
                    line.getCategory(),
                    department,
                    fundId,
                    resolveProgramId(budget),
                    null,
                    fromDateTime,
                    toDateTime);

            BigDecimal variance = line.getAmount().subtract(actual);
            lines.add(BudgetVarianceLine.builder()
                    .lineId(line.getId())
                    .category(line.getCategory())
                    .department(department)
                    .fundId(fundId)
                    .fundName(line.getFund() != null ? line.getFund().getName() : null)
                    .budgetAmount(line.getAmount())
                    .actualAmount(actual)
                    .variance(variance)
                    .utilizationPercent(percent(actual, line.getAmount()))
                    .build());

            totalBudget = totalBudget.add(line.getAmount());
            totalActual = totalActual.add(actual);
        }

        lines.sort(Comparator.comparing(BudgetVarianceLine::getCategory));

        return BudgetVarianceResponse.builder()
                .budgetId(budget.getId())
                .budgetName(budget.getName())
                .status(budget.getStatus())
                .scopeType(budget.getScopeType())
                .fromDate(fromDate)
                .toDate(toDate)
                .lines(lines)
                .totalBudget(totalBudget)
                .totalActual(totalActual)
                .totalVariance(totalBudget.subtract(totalActual))
                .utilizationPercent(percent(totalActual, totalBudget))
                .build();
    }

    private String resolveDepartment(Budget budget, BudgetLine line) {
        if (line.getDepartment() != null) {
            return line.getDepartment();
        }
        if (budget.getScopeType() == BudgetScopeType.DEPARTMENT) {
            return budget.getDepartment();
        }
        return null;
    }

    private Long resolveProgramId(Budget budget) {
        if (budget.getScopeType() == BudgetScopeType.PROGRAM && budget.getProgram() != null) {
            return budget.getProgram().getId();
        }
        return null;
    }

    private void deactivateConflictingActiveBudgets(Budget budget) {
        Long organizationId = budget.getOrganization().getId();
        List<Budget> activeBudgets = budgetRepository.findByOrganizationIdAndFiscalYearAndStatusAndDeletedFalse(
                organizationId, budget.getFiscalYear(), BudgetStatus.ACTIVE);

        for (Budget active : activeBudgets) {
            if (!active.getId().equals(budget.getId())
                    && active.getScopeType() == budget.getScopeType()
                    && scopesOverlap(active, budget)) {
                active.setStatus(BudgetStatus.CLOSED);
                budgetRepository.save(active);
            }
        }
    }

    private boolean scopesOverlap(Budget existing, Budget incoming) {
        if (existing.getScopeType() != incoming.getScopeType()) {
            return false;
        }
        return switch (existing.getScopeType()) {
            case ORGANIZATION -> true;
            case DEPARTMENT -> existing.getDepartment().equalsIgnoreCase(incoming.getDepartment());
            case FUND -> existing.getFund().getId().equals(incoming.getFund().getId());
            case CAMPAIGN -> existing.getCampaign().getId().equals(incoming.getCampaign().getId());
            case PROGRAM -> existing.getProgram().getId().equals(incoming.getProgram().getId());
        };
    }

    private void validateBudgetRequest(BudgetRequest request) {
        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new BadRequestException("End date must be on or after start date");
        }

        switch (request.getScopeType()) {
            case DEPARTMENT -> {
                if (request.getDepartment() == null || request.getDepartment().isBlank()) {
                    throw new BadRequestException("Department is required for department budgets");
                }
            }
            case FUND -> {
                if (request.getFundId() == null) {
                    throw new BadRequestException("Fund is required for fund budgets");
                }
            }
            case CAMPAIGN -> {
                if (request.getCampaignId() == null) {
                    throw new BadRequestException("Campaign is required for campaign budgets");
                }
            }
            case PROGRAM -> {
                if (request.getProgramId() == null) {
                    throw new BadRequestException("Program is required for program budgets");
                }
            }
            default -> {
            }
        }
    }

    private void applyRequest(UserPrincipal principal, Budget budget, BudgetRequest request) {
        budget.setName(request.getName());
        budget.setFiscalYear(request.getFiscalYear());
        budget.setStartDate(request.getStartDate());
        budget.setEndDate(request.getEndDate());
        budget.setScopeType(request.getScopeType());
        budget.setDepartment(request.getDepartment());

        if (request.getFundId() != null) {
            Fund fund = fundService.requireFund(principal, request.getFundId());
            budget.setFund(fund);
        } else {
            budget.setFund(null);
        }

        if (request.getCampaignId() != null) {
            Campaign campaign = campaignService.requireCampaign(principal, request.getCampaignId());
            budget.setCampaign(campaign);
        } else {
            budget.setCampaign(null);
        }

        if (request.getProgramId() != null) {
            Program program = programService.requireProgram(principal, request.getProgramId());
            budget.setProgram(program);
        } else {
            budget.setProgram(null);
        }
    }

    private void applyLineRequest(UserPrincipal principal, BudgetLine line, BudgetLineRequest request) {
        line.setCategory(request.getCategory());
        line.setDepartment(request.getDepartment());
        line.setAmount(request.getAmount());
        line.setDescription(request.getDescription());

        if (request.getFundId() != null) {
            Fund fund = fundService.requireFund(principal, request.getFundId());
            line.setFund(fund);
        } else {
            line.setFund(null);
        }
    }

    private Budget requireBudget(UserPrincipal principal, Long budgetId) {
        Long organizationId = tenantSupport.organizationId(principal);
        return budgetRepository.findByIdAndOrganizationIdAndDeletedFalse(budgetId, organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("Budget not found"));
    }

    private BudgetLine requireLine(Long budgetId, Long lineId) {
        return budgetLineRepository.findByIdAndBudgetIdAndDeletedFalse(lineId, budgetId)
                .orElseThrow(() -> new ResourceNotFoundException("Budget line not found"));
    }

    private void ensureDraft(Budget budget) {
        if (budget.getStatus() != BudgetStatus.DRAFT) {
            throw new BadRequestException("Only draft budgets can be modified");
        }
    }

    private BudgetResponse toResponse(Budget budget) {
        List<BudgetLine> lines = budgetLineRepository.findByBudgetIdAndDeletedFalse(budget.getId());
        BigDecimal totalBudget = lines.stream()
                .map(BudgetLine::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return BudgetResponse.builder()
                .id(budget.getId())
                .name(budget.getName())
                .fiscalYear(budget.getFiscalYear())
                .startDate(budget.getStartDate())
                .endDate(budget.getEndDate())
                .status(budget.getStatus())
                .scopeType(budget.getScopeType())
                .department(budget.getDepartment())
                .fundId(budget.getFund() != null ? budget.getFund().getId() : null)
                .fundName(budget.getFund() != null ? budget.getFund().getName() : null)
                .campaignId(budget.getCampaign() != null ? budget.getCampaign().getId() : null)
                .campaignName(budget.getCampaign() != null ? budget.getCampaign().getName() : null)
                .programId(budget.getProgram() != null ? budget.getProgram().getId() : null)
                .programName(budget.getProgram() != null ? budget.getProgram().getName() : null)
                .totalBudget(totalBudget)
                .lines(lines.stream().map(this::toLineResponse).toList())
                .createdAt(budget.getCreatedAt())
                .build();
    }

    private BudgetLineResponse toLineResponse(BudgetLine line) {
        return BudgetLineResponse.builder()
                .id(line.getId())
                .category(line.getCategory())
                .department(line.getDepartment())
                .fundId(line.getFund() != null ? line.getFund().getId() : null)
                .fundName(line.getFund() != null ? line.getFund().getName() : null)
                .amount(line.getAmount())
                .description(line.getDescription())
                .build();
    }

    private BigDecimal percent(BigDecimal actual, BigDecimal budget) {
        if (budget == null || budget.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }
        return actual.multiply(BigDecimal.valueOf(100))
                .divide(budget, 2, RoundingMode.HALF_UP);
    }
}
