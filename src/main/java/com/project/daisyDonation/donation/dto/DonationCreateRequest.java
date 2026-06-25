package com.project.daisyDonation.donation.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;

import com.project.daisyDonation.donation.entity.DonationType;

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
@Schema(description = "Request payload for donation create")
public class DonationCreateRequest {
    @Schema(description = "donor id")
    private Long donorId;
    @Schema(description = "amount")
    @NotNull
    @DecimalMin(value = "0.01", message = "Amount must be greater than zero")
    private BigDecimal amount;
    @Schema(description = "donation type")
    @NotNull
    private DonationType donationType;
    @Schema(description = "anonymous")
    private boolean anonymous;
    @Schema(description = "campaign id")
    private Long campaignId;
    @Schema(description = "pledge id")
    private Long pledgeId;
    @Schema(description = "recurring donation id")
    private Long recurringDonationId;
    @Schema(description = "source")
    @Size(max = 100)
    private String source;
    @Schema(description = "notes")
    @Size(max = 1000)
    private String notes;
    @Schema(description = "item description")
    @Size(max = 500)
    private String itemDescription;
    @Schema(description = "estimated value")
    private BigDecimal estimatedValue;
}
