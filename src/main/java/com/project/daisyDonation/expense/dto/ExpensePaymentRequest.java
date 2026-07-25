package com.project.daisyDonation.expense.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;

import com.project.daisyDonation.payment.entity.PaymentMethod;

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
@Schema(description = "Request payload for expense payment")
public class ExpensePaymentRequest {
    @Schema(description = "payment method")
    @NotNull
    private PaymentMethod paymentMethod;
    @Schema(description = "payment reference")
    @NotBlank
    @Size(max = 100)
    private String paymentReference;
    @Schema(description = "paid at")
    @NotNull
    private LocalDateTime paidAt;
}
