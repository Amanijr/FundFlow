package com.project.daisyDonation.accounting.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDate;

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
@Schema(description = "Request payload for chart of account")
public class ChartOfAccountRequest {
    @Schema(description = "code")
    @NotBlank
    @Size(max = 20)
    private String code;
    @Schema(description = "name")
    @NotBlank
    @Size(max = 255)
    private String name;
    @Schema(description = "account type")
    @NotNull
    private com.project.daisyDonation.accounting.entity.AccountType accountType;
    @Schema(description = "description")
    @Size(max = 500)
    private String description;
    private boolean active = true;
}
