package com.project.daisyDonation.expense.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;

import com.project.daisyDonation.expense.entity.ExpenseCategory;
import com.project.daisyDonation.expense.entity.ExpenseType;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Request payload for expense")
public class ExpenseRequest {
    @Schema(description = "title")
    @NotBlank
    @Size(max = 255)
    private String title;
    @Schema(description = "description")
    @Size(max = 2000)
    private String description;
    @Schema(description = "amount")
    @NotNull
    @DecimalMin(value = "0.01", message = "Amount must be greater than zero")
    private BigDecimal amount;
    @Schema(description = "category")
    @NotNull
    private ExpenseCategory category;
    @Schema(description = "expense type")
    @NotNull
    private ExpenseType expenseType;
    @Schema(description = "fund id")
    private Long fundId;
    @Schema(description = "program id")
    private Long programId;
    @Schema(description = "grant id")
    private Long grantId;
    @Schema(description = "payee name")
    @Size(max = 255)
    private String payeeName;
    @Schema(description = "department")
    @Size(max = 100)
    private String department;
}
