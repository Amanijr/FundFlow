package com.project.daisyDonation.fund.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;

import com.project.daisyDonation.fund.entity.FundType;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
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
@Schema(description = "Request payload for fund")
public class FundRequest {
    @Schema(description = "name")
    @NotBlank
    @Size(max = 255)
    private String name;
    @Schema(description = "code")
    @NotBlank
    @Size(max = 50)
    private String code;
    @Schema(description = "type")
    @NotNull
    private FundType type;
    @Schema(description = "description")
    @Size(max = 1000)
    private String description;
    @Schema(description = "opening balance")
    @DecimalMin(value = "0.00", message = "Opening balance cannot be negative")
    private BigDecimal openingBalance;
    private boolean active = true;
}
