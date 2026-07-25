package com.project.daisyDonation.expense.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Request payload for expense rejection")
public class ExpenseRejectionRequest {
    @Schema(description = "reason")
    @NotBlank
    @Size(max = 500)
    private String reason;
}
