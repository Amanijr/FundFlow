package com.project.daisyDonation.workflow.service;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.project.daisyDonation.auth.entity.User;
import com.project.daisyDonation.auth.repository.UserRepository;
import com.project.daisyDonation.common.security.UserPrincipal;
import com.project.daisyDonation.common.service.TenantSupport;
import com.project.daisyDonation.expense.entity.Expense;
import com.project.daisyDonation.expense.entity.ExpenseStatus;
import com.project.daisyDonation.expense.repository.ExpenseRepository;
import com.project.daisyDonation.workflow.dto.InboxItemResponse;
import com.project.daisyDonation.workflow.dto.InboxListResponse;
import com.project.daisyDonation.workflow.dto.InboxRequestorResponse;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class WorkflowInboxService {

    private static final int DEFAULT_PAGE_SIZE = 50;
    private static final int MAX_PAGE_SIZE = 100;
    private static final long SLA_HOURS = 72;

    private final ExpenseRepository expenseRepository;
    private final UserRepository userRepository;
    private final TenantSupport tenantSupport;

    @Transactional(readOnly = true)
    public long count(UserPrincipal principal) {
        Long organizationId = tenantSupport.organizationId(principal);
        return expenseRepository.countByStatus(organizationId, ExpenseStatus.SUBMITTED);
    }

    @Transactional(readOnly = true)
    public InboxListResponse list(
            UserPrincipal principal,
            String status,
            String entityType,
            String query,
            String sort,
            Integer page,
            Integer size) {
        if (status != null
                && !status.isBlank()
                && !"action_required".equals(status)
                && !"pending".equals(status)
                && !"all".equals(status)) {
            return InboxListResponse.builder()
                    .items(List.of())
                    .page(0)
                    .totalPages(0)
                    .totalElements(0)
                    .build();
        }

        Long organizationId = tenantSupport.organizationId(principal);
        List<InboxItemResponse> items = expenseRepository
                .findByOrganizationIdAndStatusAndDeletedFalse(organizationId, ExpenseStatus.SUBMITTED)
                .stream()
                .map(this::toInboxItem)
                .filter(item -> matchesEntityType(item, entityType))
                .filter(item -> matchesQuery(item, query))
                .sorted(comparatorFor(sort))
                .toList();

        int pageIndex = page == null || page < 0 ? 0 : page;
        int pageSize = size == null ? DEFAULT_PAGE_SIZE : Math.min(Math.max(size, 1), MAX_PAGE_SIZE);
        int fromIndex = Math.min(pageIndex * pageSize, items.size());
        int toIndex = Math.min(fromIndex + pageSize, items.size());
        int totalPages = items.isEmpty() ? 0 : (int) Math.ceil(items.size() / (double) pageSize);

        return InboxListResponse.builder()
                .items(items.subList(fromIndex, toIndex))
                .page(pageIndex)
                .totalPages(totalPages)
                .totalElements(items.size())
                .build();
    }

    private InboxItemResponse toInboxItem(Expense expense) {
        Instant submittedAt = toInstant(expense.getSubmittedAt() != null
                ? expense.getSubmittedAt()
                : expense.getCreatedAt());
        Instant slaDueAt = submittedAt.plusSeconds(SLA_HOURS * 3600);
        boolean breached = Instant.now().isAfter(slaDueAt);

        return InboxItemResponse.builder()
                .id("expense-" + expense.getId())
                .workflowInstanceId("expense-" + expense.getId())
                .title(expense.getTitle())
                .summary(expense.getDescription())
                .module("expenses")
                .entityType("expense")
                .entityId(expense.getId())
                .requestor(InboxRequestorResponse.builder()
                        .id(expense.getRequestedByUserId())
                        .name(requestorName(expense))
                        .build())
                .submittedAt(submittedAt)
                .currentStage("approval")
                .currentStageLabel("Approval")
                .status("pending")
                .priority("normal")
                .slaDueAt(slaDueAt)
                .slaBreached(breached)
                .slaStatus(breached ? "breached" : "on_track")
                .actionRequired(true)
                .href("/expenses/" + expense.getId())
                .amount(expense.getAmount())
                .currency("TZS")
                .build();
    }

    private String requestorName(Expense expense) {
        if (expense.getRequestedByUserId() == null) {
            return expense.getPayeeName() != null ? expense.getPayeeName() : "Staff";
        }
        return userRepository.findByIdAndDeletedFalse(expense.getRequestedByUserId())
                .map(this::fullName)
                .orElse(expense.getPayeeName() != null ? expense.getPayeeName() : "Staff");
    }

    private String fullName(User user) {
        return (user.getFirstName() + " " + user.getLastName()).trim();
    }

    private boolean matchesEntityType(InboxItemResponse item, String entityType) {
        return entityType == null || entityType.isBlank() || entityType.equalsIgnoreCase(item.getEntityType());
    }

    private boolean matchesQuery(InboxItemResponse item, String query) {
        if (query == null || query.isBlank()) {
            return true;
        }
        String needle = query.toLowerCase(Locale.ROOT);
        return (item.getTitle() != null && item.getTitle().toLowerCase(Locale.ROOT).contains(needle))
                || (item.getSummary() != null && item.getSummary().toLowerCase(Locale.ROOT).contains(needle));
    }

    private Comparator<InboxItemResponse> comparatorFor(String sort) {
        if ("oldest".equals(sort) || "sla".equals(sort)) {
            return Comparator.comparing(InboxItemResponse::getSubmittedAt, Comparator.nullsLast(Comparator.naturalOrder()));
        }
        if ("priority".equals(sort)) {
            return Comparator.comparing(InboxItemResponse::getPriority)
                    .thenComparing(InboxItemResponse::getSubmittedAt, Comparator.reverseOrder());
        }
        return Comparator.comparing(InboxItemResponse::getSubmittedAt, Comparator.nullsLast(Comparator.reverseOrder()));
    }

    private Instant toInstant(LocalDateTime value) {
        return value.atOffset(ZoneOffset.UTC).toInstant();
    }
}
