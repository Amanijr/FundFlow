package com.project.daisyDonation.communication.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.project.daisyDonation.payment.entity.PaymentMethod;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Response payload for receipt")
public class ReceiptResponse {

    private Long donationId;
    private Long paymentId;
    private String receiptNumber;
    private String organizationName;
    private String donorName;
    private boolean anonymous;
    private BigDecimal amount;
    private PaymentMethod paymentMethod;
    private LocalDateTime donationTime;
    private String subject;
    private String body;
}
