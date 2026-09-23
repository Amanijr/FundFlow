package com.project.daisyDonation.church.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.project.daisyDonation.church.entity.PartnershipStatus;

import io.swagger.v3.oas.annotations.media.Schema;
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
@Schema(description = "Create or update a monthly church partnership")
public class PartnershipRequest {

    @NotNull
    private Long memberId;
    private Long fundId;
    @NotNull
    @DecimalMin(value = "0.01", message = "Monthly amount must be greater than zero")
    private BigDecimal monthlyAmount;
    @NotNull
    private LocalDate startDate;
    private LocalDate endDate;
    private PartnershipStatus status;
    @Size(max = 2000)
    private String notes;
}
