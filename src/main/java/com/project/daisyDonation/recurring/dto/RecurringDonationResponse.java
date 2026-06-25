package com.project.daisyDonation.recurring.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import com.project.daisyDonation.recurring.entity.RecurringFrequency;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Response payload for recurring donation")
public class RecurringDonationResponse {

    private Long id;
    private Long organizationId;
    private Long donorId;
    private String donorName;
    private Long campaignId;
    private String campaignName;
    private BigDecimal amount;
    private RecurringFrequency frequency;
    private LocalDate startDate;
    private LocalDate endDate;
    private boolean active;
    private String notes;
    private LocalDateTime createdAt;
}
