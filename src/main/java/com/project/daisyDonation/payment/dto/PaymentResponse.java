package com.project.daisyDonation.payment.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;

import com.project.daisyDonation.donation.entity.DonationStatus;
import com.project.daisyDonation.payment.entity.PaymentChannel;
import com.project.daisyDonation.payment.entity.PaymentMethod;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Response payload for payment")
public class PaymentResponse {

    private Long paymentId;
    private Long donationId;
    private PaymentChannel channel;
    private PaymentMethod paymentMethod;
    private String transactionId;
    private String receiptNumber;
    private Long recordedByUserId;
    private boolean successful;
    private LocalDateTime processedAt;
    private LocalDateTime collectionDate;
    private DonationStatus donationStatus;
}
