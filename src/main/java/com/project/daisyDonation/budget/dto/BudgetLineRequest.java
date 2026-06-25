package com.project.daisyDonation.budget.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;

import com.project.daisyDonation.expense.entity.ExpenseCategory;

import jakarta.validation.constraints.DecimalMin;
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
@Schema(description = "Request payload for budget line")
public class BudgetLineRequest {
    @Schema(description = "category")
    @NotNull
    private ExpenseCategory category;
    @Schema(description = "department")
    @Size(max = 100)
    private String department;
    @Schema(description = "fund id")
    private Long fundId;
    @Schema(description = "amount")
    @NotNull
    @DecimalMin(value = "0.01", message = "Amount must be greater than zero")
    private BigDecimal amount;
    @Schema(description = "description")
    @Size(max = 500)
    private String description;
}
