package com.project.daisyDonation.expense.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.project.daisyDonation.accounting.service.AccountingPostingService;
import com.project.daisyDonation.common.exception.BadRequestException;
import com.project.daisyDonation.common.exception.ResourceNotFoundException;
import com.project.daisyDonation.common.security.UserPrincipal;
import com.project.daisyDonation.common.service.TenantSupport;
import com.project.daisyDonation.expense.dto.ExpenseCategorySummary;
import com.project.daisyDonation.expense.dto.ExpensePaymentRequest;
import com.project.daisyDonation.expense.dto.ExpenseRejectionRequest;
import com.project.daisyDonation.expense.dto.ExpenseReportResponse;
import com.project.daisyDonation.expense.dto.ExpenseRequest;
import com.project.daisyDonation.expense.dto.ExpenseResponse;
import com.project.daisyDonation.expense.entity.Expense;
import com.project.daisyDonation.expense.entity.ExpenseCategory;
import com.project.daisyDonation.expense.entity.ExpenseStatus;
import com.project.daisyDonation.expense.repository.ExpenseRepository;
import com.project.daisyDonation.fund.entity.Fund;
import com.project.daisyDonation.fund.service.FundBalanceService;
import com.project.daisyDonation.fund.service.FundService;
import com.project.daisyDonation.grant.entity.Grant;
import com.project.daisyDonation.grant.service.GrantService;
import com.project.daisyDonation.organization.entity.Organization;
import com.project.daisyDonation.program.entity.Program;
import com.project.daisyDonation.program.service.ProgramService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final TenantSupport tenantSupport;
    private final FundService fundService;
    private final FundBalanceService fundBalanceService;
    private final AccountingPostingService accountingPostingService;
    private final ProgramService programService;
    private final GrantService grantService;

    @Transactional
    public ExpenseResponse create(UserPrincipal principal, ExpenseRequest request) {
        Organization organization = tenantSupport.organization(principal);

        Expense expense = new Expense();
        expense.setOrganization(organization);
        expense.setRequestedByUserId(principal.getId());
        expense.setStatus(ExpenseStatus.DRAFT);
        applyRequest(principal, expense, request);

        return toResponse(expenseRepository.save(expense));
    }

    @Transactional
    public ExpenseResponse update(UserPrincipal principal, Long expenseId, ExpenseRequest request) {
        Expense expense = requireExpense(principal, expenseId);
        ensureEditable(expense);
        applyRequest(principal, expense, request);
        return toResponse(expenseRepository.save(expense));
    }

    @Transactional
    public ExpenseResponse submit(UserPrincipal principal, Long expenseId) {
        Expense expense = requireExpense(principal, expenseId);

        if (expense.getStatus() != ExpenseStatus.DRAFT && expense.getStatus() != ExpenseStatus.REJECTED) {
            throw new BadRequestException("Only draft or rejected expenses can be submitted");
        }

        expense.setStatus(ExpenseStatus.SUBMITTED);
        expense.setSubmittedAt(LocalDateTime.now());
        expense.setRejectionReason(null);
        return toResponse(expenseRepository.save(expense));
    }

    @Transactional
    public ExpenseResponse approve(UserPrincipal principal, Long expenseId) {
        Expense expense = requireExpense(principal, expenseId);

        if (expense.getStatus() != ExpenseStatus.SUBMITTED) {
            throw new BadRequestException("Only submitted expenses can be approved");
        }

        expense.setStatus(ExpenseStatus.APPROVED);
        expense.setApprovedByUserId(principal.getId());
        expense.setApprovedAt(LocalDateTime.now());
        return toResponse(expenseRepository.save(expense));
    }

    @Transactional
    public ExpenseResponse reject(UserPrincipal principal, Long expenseId, ExpenseRejectionRequest request) {
        Expense expense = requireExpense(principal, expenseId);

        if (expense.getStatus() != ExpenseStatus.SUBMITTED) {
            throw new BadRequestException("Only submitted expenses can be rejected");
        }

        expense.setStatus(ExpenseStatus.REJECTED);
        expense.setRejectionReason(request.getReason());
        return toResponse(expenseRepository.save(expense));
    }

    @Transactional
    public ExpenseResponse pay(UserPrincipal principal, Long expenseId, ExpensePaymentRequest request) {
        Expense expense = requireExpense(principal, expenseId);

        if (expense.getStatus() != ExpenseStatus.APPROVED) {
            throw new BadRequestException("Only approved expenses can be paid");
        }

        if (expense.getFund() != null) {
            fundBalanceService.ensureSufficientBalance(
                    expense.getFund().getId(),
                    expense.getOrganization().getId(),
                    expense.getAmount());
        }

        expense.setStatus(ExpenseStatus.PAID);
        expense.setPaidAt(request.getPaidAt());
        expense.setPaidByUserId(principal.getId());
        expense.setPaymentMethod(request.getPaymentMethod());
        expense.setPaymentReference(request.getPaymentReference());

        Expense saved = expenseRepository.save(expense);
        accountingPostingService.postExpensePayment(saved.getOrganization(), principal.getId(), saved);

        return toResponse(saved);
    }

    @Transactional
    public ExpenseResponse reconcile(UserPrincipal principal, Long expenseId) {
        Expense expense = requireExpense(principal, expenseId);

        if (expense.getStatus() != ExpenseStatus.PAID) {
            throw new BadRequestException("Only paid expenses can be reconciled");
        }

        expense.setStatus(ExpenseStatus.RECONCILED);
        expense.setReconciledAt(LocalDateTime.now());
        expense.setReconciledByUserId(principal.getId());

        return toResponse(expenseRepository.save(expense));
    }

    @Transactional(readOnly = true)
    public List<ExpenseResponse> list(UserPrincipal principal) {
        Long organizationId = tenantSupport.organizationId(principal);
        return expenseRepository.findByOrganizationIdAndDeletedFalse(organizationId).stream()
                .sorted(Comparator.comparing(Expense::getCreatedAt).reversed())
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public ExpenseResponse getById(UserPrincipal principal, Long expenseId) {
        return toResponse(requireExpense(principal, expenseId));
    }

    @Transactional(readOnly = true)
    public ExpenseReportResponse getReport(UserPrincipal principal) {
        Long organizationId = tenantSupport.organizationId(principal);

        List<ExpenseCategorySummary> byCategory = Arrays.stream(ExpenseCategory.values())
                .map(category -> {
                    BigDecimal total = expenseRepository.sumPaidAmountByCategory(organizationId, category);
                    long count = expenseRepository.findByOrganizationIdAndDeletedFalse(organizationId).stream()
                            .filter(e -> e.getCategory() == category
                                    && (e.getStatus() == ExpenseStatus.PAID
                                            || e.getStatus() == ExpenseStatus.RECONCILED))
                            .count();
                    return ExpenseCategorySummary.builder()
                            .category(category)
                            .totalPaidAmount(total)
                            .expenseCount(count)
                            .build();
                })
                .filter(s -> s.getExpenseCount() > 0
                        || s.getTotalPaidAmount().compareTo(BigDecimal.ZERO) > 0)
                .toList();

        List<ExpenseResponse> recentExpenses = expenseRepository
                .findByOrganizationIdAndDeletedFalse(organizationId).stream()
                .filter(e -> e.getStatus() == ExpenseStatus.PAID
                        || e.getStatus() == ExpenseStatus.RECONCILED)
                .sorted(Comparator.comparing(
                        e -> e.getPaidAt() != null ? e.getPaidAt() : e.getCreatedAt(),
                        Comparator.reverseOrder()))
                .limit(10)
                .map(this::toResponse)
                .toList();

        return ExpenseReportResponse.builder()
                .totalPaidAmount(expenseRepository.sumTotalPaidAmount(organizationId))
                .pendingApprovals(expenseRepository.countByStatus(organizationId, ExpenseStatus.SUBMITTED))
                .paidCount(expenseRepository.countByStatus(organizationId, ExpenseStatus.PAID))
                .reconciledCount(expenseRepository.countByStatus(organizationId, ExpenseStatus.RECONCILED))
                .byCategory(byCategory)
                .recentExpenses(recentExpenses)
                .build();
    }

    public Expense requireExpense(UserPrincipal principal, Long expenseId) {
        Long organizationId = tenantSupport.organizationId(principal);
        return expenseRepository.findByIdAndOrganizationIdAndDeletedFalse(expenseId, organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("Expense not found"));
    }

    private void ensureEditable(Expense expense) {
        if (expense.getStatus() != ExpenseStatus.DRAFT && expense.getStatus() != ExpenseStatus.REJECTED) {
            throw new BadRequestException("Only draft or rejected expenses can be edited");
        }
    }

    private void applyRequest(UserPrincipal principal, Expense expense, ExpenseRequest request) {
        expense.setTitle(request.getTitle());
        expense.setDescription(request.getDescription());
        expense.setAmount(request.getAmount());
        expense.setCategory(request.getCategory());
        expense.setExpenseType(request.getExpenseType());
        expense.setPayeeName(request.getPayeeName());
        expense.setDepartment(request.getDepartment());

        if (request.getFundId() != null) {
            Fund fund = fundService.requireFund(principal, request.getFundId());
            expense.setFund(fund);
        } else {
            expense.setFund(null);
        }

        if (request.getProgramId() != null) {
            Program program = programService.requireProgram(principal, request.getProgramId());
            expense.setProgram(program);
        } else {
            expense.setProgram(null);
        }

        if (request.getGrantId() != null) {
            Grant grant = grantService.requireGrant(principal, request.getGrantId());
            expense.setGrant(grant);
        } else {
            expense.setGrant(null);
        }
    }

    private ExpenseResponse toResponse(Expense expense) {
        return ExpenseResponse.builder()
                .id(expense.getId())
                .organizationId(expense.getOrganization().getId())
                .title(expense.getTitle())
                .description(expense.getDescription())
                .amount(expense.getAmount())
                .category(expense.getCategory())
                .expenseType(expense.getExpenseType())
                .fundId(expense.getFund() != null ? expense.getFund().getId() : null)
                .fundName(expense.getFund() != null ? expense.getFund().getName() : null)
                .programId(expense.getProgram() != null ? expense.getProgram().getId() : null)
                .programName(expense.getProgram() != null ? expense.getProgram().getName() : null)
                .grantId(expense.getGrant() != null ? expense.getGrant().getId() : null)
                .grantName(expense.getGrant() != null ? expense.getGrant().getName() : null)
                .status(expense.getStatus())
                .requestedByUserId(expense.getRequestedByUserId())
                .payeeName(expense.getPayeeName())
                .department(expense.getDepartment())
                .submittedAt(expense.getSubmittedAt())
                .approvedByUserId(expense.getApprovedByUserId())
                .approvedAt(expense.getApprovedAt())
                .rejectionReason(expense.getRejectionReason())
                .paidAt(expense.getPaidAt())
                .paidByUserId(expense.getPaidByUserId())
                .paymentMethod(expense.getPaymentMethod())
                .paymentReference(expense.getPaymentReference())
                .reconciledAt(expense.getReconciledAt())
                .reconciledByUserId(expense.getReconciledByUserId())
                .createdAt(expense.getCreatedAt())
                .build();
    }
}
