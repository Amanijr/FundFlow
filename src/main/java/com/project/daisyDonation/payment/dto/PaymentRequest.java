package com.project.daisyDonation.payment.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import com.project.daisyDonation.payment.entity.PaymentMethod;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Request payload for payment")
public class PaymentRequest {
    @Schema(description = "payment method")
    @NotNull
    private PaymentMethod paymentMethod;
    @Schema(description = "simulate failure")
    private boolean simulateFailure;
}
