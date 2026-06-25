package com.project.daisyDonation.expense.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.project.daisyDonation.common.entity.TenantEntity;
import com.project.daisyDonation.fund.entity.Fund;
import com.project.daisyDonation.grant.entity.Grant;
import com.project.daisyDonation.payment.entity.PaymentMethod;
import com.project.daisyDonation.program.entity.Program;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "expense")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Expense extends TenantEntity {

    @Column(nullable = false, length = 255)
    private String title;

    @Column(length = 2000)
    private String description;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private ExpenseCategory category;

    @Enumerated(EnumType.STRING)
    @Column(name = "expense_type", nullable = false, length = 50)
    private ExpenseType expenseType = ExpenseType.REQUEST;

    @ManyToOne
    @JoinColumn(name = "fund_id")
    private Fund fund;

    @ManyToOne
    @JoinColumn(name = "program_id")
    private Program program;

    @ManyToOne
    @JoinColumn(name = "grant_id")
    private Grant grant;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private ExpenseStatus status = ExpenseStatus.DRAFT;

    @Column(name = "requested_by_user_id")
    private Long requestedByUserId;

    @Column(name = "payee_name", length = 255)
    private String payeeName;

    @Column(length = 100)
    private String department;

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;

    @Column(name = "approved_by_user_id")
    private Long approvedByUserId;

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;

    @Column(name = "rejection_reason", length = 500)
    private String rejectionReason;

    @Column(name = "paid_at")
    private LocalDateTime paidAt;

    @Column(name = "paid_by_user_id")
    private Long paidByUserId;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", length = 50)
    private PaymentMethod paymentMethod;

    @Column(name = "payment_reference", length = 100)
    private String paymentReference;

    @Column(name = "reconciled_at")
    private LocalDateTime reconciledAt;

    @Column(name = "reconciled_by_user_id")
    private Long reconciledByUserId;
}
