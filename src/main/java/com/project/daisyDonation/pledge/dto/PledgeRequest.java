package com.project.daisyDonation.pledge.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;
import java.time.LocalDate;

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
@Schema(description = "Request payload for pledge")
public class PledgeRequest {
    @Schema(description = "donor id")
    @NotNull
    private Long donorId;
    @Schema(description = "campaign id")
    private Long campaignId;
    @Schema(description = "pledged amount")
    @NotNull
    @DecimalMin(value = "0.01", message = "Pledged amount must be greater than zero")
    private BigDecimal pledgedAmount;
    @Schema(description = "due date")
    private LocalDate dueDate;
    @Schema(description = "notes")
    @Size(max = 1000)
    private String notes;
}
