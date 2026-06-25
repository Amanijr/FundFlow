package com.project.daisyDonation.collection.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.project.daisyDonation.payment.entity.PaymentMethod;

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
@Schema(description = "Request payload for collection session count")
public class CollectionSessionCountRequest {
    @Schema(description = "total amount")
    @NotNull
    @DecimalMin(value = "0.01", message = "Total amount must be greater than zero")
    private BigDecimal totalAmount;
    @Schema(description = "payment method")
    @NotNull
    private PaymentMethod paymentMethod;
    @Schema(description = "collected at")
    @NotNull
    private LocalDateTime collectedAt;
    @Schema(description = "notes")
    @Size(max = 1000)
    private String notes;
}
