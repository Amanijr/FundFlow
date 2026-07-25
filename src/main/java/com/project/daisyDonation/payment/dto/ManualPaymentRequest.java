package com.project.daisyDonation.payment.dto;

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
@Schema(description = "Request payload for manual payment")
public class ManualPaymentRequest {
    @Schema(description = "payment method")
    @NotNull
    private PaymentMethod paymentMethod;
    @Schema(description = "receipt number")
    @NotBlank
    @Size(max = 100)
    private String receiptNumber;
    @Schema(description = "collection date")
    @NotNull
    private LocalDateTime collectionDate;
    @Schema(description = "payment notes")
    @Size(max = 500)
    private String paymentNotes;
}
