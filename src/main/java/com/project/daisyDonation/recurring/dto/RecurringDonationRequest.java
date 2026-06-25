package com.project.daisyDonation.recurring.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.project.daisyDonation.recurring.entity.RecurringFrequency;

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
@Schema(description = "Request payload for recurring donation")
public class RecurringDonationRequest {
    @Schema(description = "donor id")
    @NotNull
    private Long donorId;
    @Schema(description = "campaign id")
    private Long campaignId;
    @Schema(description = "amount")
    @NotNull
    @DecimalMin(value = "0.01", message = "Amount must be greater than zero")
    private BigDecimal amount;
    @Schema(description = "frequency")
    @NotNull
    private RecurringFrequency frequency;
    @Schema(description = "start date")
    @NotNull
    private LocalDate startDate;
    @Schema(description = "end date")
    private LocalDate endDate;
    private boolean active = true;
    @Schema(description = "notes")
    @Size(max = 500)
    private String notes;
}
