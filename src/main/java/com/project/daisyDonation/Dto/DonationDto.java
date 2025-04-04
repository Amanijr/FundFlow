package com.project.daisyDonation.Dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.project.daisyDonation.Entity.Abstract.DonationStatus;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor

public class DonationDto {
    private Long donorId;
    private BigDecimal amount;
    private LocalDateTime donationTime;
    private DonationStatus status;

}
