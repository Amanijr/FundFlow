package com.project.daisyDonation.program.service;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.project.daisyDonation.budget.entity.Budget;
import com.project.daisyDonation.budget.entity.BudgetScopeType;
import com.project.daisyDonation.budget.entity.BudgetStatus;
import com.project.daisyDonation.budget.repository.BudgetLineRepository;
import com.project.daisyDonation.budget.repository.BudgetRepository;
import com.project.daisyDonation.common.exception.BadRequestException;
import com.project.daisyDonation.common.exception.ConflictException;
import com.project.daisyDonation.common.exception.ResourceNotFoundException;
import com.project.daisyDonation.common.security.UserPrincipal;
import com.project.daisyDonation.common.service.TenantSupport;
import com.project.daisyDonation.expense.repository.ExpenseRepository;
import com.project.daisyDonation.fund.entity.Fund;
import com.project.daisyDonation.fund.service.FundService;
import com.project.daisyDonation.grant.entity.Grant;
import com.project.daisyDonation.grant.entity.GrantStatus;
import com.project.daisyDonation.grant.repository.GrantRepository;
import com.project.daisyDonation.organization.entity.Organization;
import com.project.daisyDonation.program.dto.ProgramDashboardResponse;
import com.project.daisyDonation.program.dto.ProgramRequest;
import com.project.daisyDonation.program.dto.ProgramResponse;
import com.project.daisyDonation.program.entity.Program;
import com.project.daisyDonation.program.repository.ProgramRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProgramService {

    private final ProgramRepository programRepository;
    private final GrantRepository grantRepository;
    private final BudgetRepository budgetRepository;
    private final BudgetLineRepository budgetLineRepository;
    private final ExpenseRepository expenseRepository;
    private final FundService fundService;
    private final TenantSupport tenantSupport;

    @Transactional
    public ProgramResponse create(UserPrincipal principal, ProgramRequest request) {
        Organization organization = tenantSupport.organization(principal);
        validateDates(request);

        if (programRepository.existsByOrganizationIdAndCodeAndDeletedFalse(organization.getId(), request.getCode())) {
            throw new ConflictException("Program code already exists in this organization");
        }

        Program program = new Program();
        program.setOrganization(organization);
        applyRequest(principal, program, request);

        return toResponse(programRepository.save(program));
    }

    @Transactional(readOnly = true)
    public List<ProgramResponse> list(UserPrincipal principal) {
        Long organizationId = tenantSupport.organizationId(principal);
        return programRepository.findByOrganizationIdAndDeletedFalse(organizationId).stream()
                .sorted(Comparator.comparing(Program::getName))
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public ProgramResponse getById(UserPrincipal principal, Long programId) {
        return toResponse(requireProgram(principal, programId));
    }

    @Transactional
    public ProgramResponse update(UserPrincipal principal, Long programId, ProgramRequest request) {
        Program program = requireProgram(principal, programId);
        validateDates(request);

        if (!program.getCode().equals(request.getCode())
                && programRepository.existsByOrganizationIdAndCodeAndDeletedFalse(
                        program.getOrganization().getId(), request.getCode())) {
            throw new ConflictException("Program code already exists in this organization");
        }

        applyRequest(principal, program, request);
        return toResponse(programRepository.save(program));
    }

    @Transactional(readOnly = true)
    public ProgramDashboardResponse getDashboard(UserPrincipal principal, Long programId) {
        Program program = requireProgram(principal, programId);
        Long organizationId = program.getOrganization().getId();

        List<Grant> grants = grantRepository.findByProgramIdAndOrganizationIdAndDeletedFalse(programId, organizationId);
        BigDecimal totalAwarded = grants.stream()
                .map(Grant::getAwardedAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalSpent = expenseRepository.sumPaidAmountByProgram(programId, organizationId);

        Budget activeBudget = budgetRepository.findByOrganizationIdAndDeletedFalse(organizationId).stream()
                .filter(b -> b.getScopeType() == BudgetScopeType.PROGRAM
                        && b.getStatus() == BudgetStatus.ACTIVE
                        && b.getProgram() != null
                        && b.getProgram().getId().equals(programId))
                .findFirst()
                .orElse(null);

        BigDecimal activeBudgetAmount = activeBudget != null
                ? budgetLineRepository.findByBudgetIdAndDeletedFalse(activeBudget.getId()).stream()
                        .map(line -> line.getAmount())
                        .reduce(BigDecimal.ZERO, BigDecimal::add)
                : BigDecimal.ZERO;

        return ProgramDashboardResponse.builder()
                .programId(program.getId())
                .programName(program.getName())
                .programCode(program.getCode())
                .grantCount(grants.size())
                .activeGrantCount(grants.stream().filter(g -> g.getStatus() == GrantStatus.ACTIVE).count())
                .totalAwarded(totalAwarded)
                .totalSpent(totalSpent)
                .remainingBalance(totalAwarded.subtract(totalSpent))
                .activeBudgetId(activeBudget != null ? activeBudget.getId() : null)
                .activeBudgetName(activeBudget != null ? activeBudget.getName() : null)
                .activeBudgetAmount(activeBudgetAmount)
                .build();
    }

    public Program requireProgram(UserPrincipal principal, Long programId) {
        Long organizationId = tenantSupport.organizationId(principal);
        return programRepository.findByIdAndOrganizationIdAndDeletedFalse(programId, organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("Program not found"));
    }

    private void validateDates(ProgramRequest request) {
        if (request.getStartDate() != null && request.getEndDate() != null
                && request.getEndDate().isBefore(request.getStartDate())) {
            throw new BadRequestException("End date must be on or after start date");
        }
    }

    private void applyRequest(UserPrincipal principal, Program program, ProgramRequest request) {
        program.setName(request.getName());
        program.setCode(request.getCode());
        program.setDescription(request.getDescription());
        program.setStatus(request.getStatus());
        program.setStartDate(request.getStartDate());
        program.setEndDate(request.getEndDate());

        if (request.getFundId() != null) {
            Fund fund = fundService.requireFund(principal, request.getFundId());
            program.setFund(fund);
        } else {
            program.setFund(null);
        }
    }

    private ProgramResponse toResponse(Program program) {
        return ProgramResponse.builder()
                .id(program.getId())
                .name(program.getName())
                .code(program.getCode())
                .description(program.getDescription())
                .status(program.getStatus())
                .startDate(program.getStartDate())
                .endDate(program.getEndDate())
                .fundId(program.getFund() != null ? program.getFund().getId() : null)
                .fundName(program.getFund() != null ? program.getFund().getName() : null)
                .createdAt(program.getCreatedAt())
                .build();
    }
}
