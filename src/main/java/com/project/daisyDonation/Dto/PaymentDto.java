package com.project.daisyDonation.Dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor

public class PaymentDto {

    private Long donationId;
       private String paymentMethod;
    private String transactionId;
    private Boolean successful;
    private LocalDateTime processedAt;
    
}
