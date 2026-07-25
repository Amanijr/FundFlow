package com.project.daisyDonation.expense.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.project.daisyDonation.expense.entity.ExpenseCategory;
import com.project.daisyDonation.expense.entity.ExpenseStatus;
import com.project.daisyDonation.expense.entity.ExpenseType;
import com.project.daisyDonation.payment.entity.PaymentMethod;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Response payload for expense")
public class ExpenseResponse {

    private Long id;
    private Long organizationId;
    private String title;
    private String description;
    private BigDecimal amount;
    private ExpenseCategory category;
    private ExpenseType expenseType;
    private Long fundId;
    private String fundName;
    private Long programId;
    private String programName;
    private Long grantId;
    private String grantName;
    private ExpenseStatus status;
    private Long requestedByUserId;
    private String payeeName;
    private String department;
    private LocalDateTime submittedAt;
    private Long approvedByUserId;
    private LocalDateTime approvedAt;
    private String rejectionReason;
    private LocalDateTime paidAt;
    private Long paidByUserId;
    private PaymentMethod paymentMethod;
    private String paymentReference;
    private LocalDateTime reconciledAt;
    private Long reconciledByUserId;
    private LocalDateTime createdAt;
}
