package com.project.daisyDonation.fund.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;
import java.time.LocalDateTime;

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
@Schema(description = "Request payload for fund transfer")
public class FundTransferRequest {
    @Schema(description = "from fund id")
    @NotNull
    private Long fromFundId;
    @Schema(description = "to fund id")
    @NotNull
    private Long toFundId;
    @Schema(description = "amount")
    @NotNull
    @DecimalMin(value = "0.01", message = "Transfer amount must be greater than zero")
    private BigDecimal amount;
    @Schema(description = "reason")
    @Size(max = 500)
    private String reason;
    @Schema(description = "transferred at")
    @NotNull
    private LocalDateTime transferredAt;
}
