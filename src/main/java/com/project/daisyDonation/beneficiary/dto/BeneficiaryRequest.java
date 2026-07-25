package com.project.daisyDonation.beneficiary.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.project.daisyDonation.beneficiary.entity.BeneficiaryStatus;
import com.project.daisyDonation.beneficiary.entity.BeneficiaryType;

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
@Schema(description = "Request payload for beneficiary")
public class BeneficiaryRequest {
    @Schema(description = "first name")
    @NotBlank
    @Size(max = 50)
    private String firstName;
    @Schema(description = "last name")
    @NotBlank
    @Size(max = 50)
    private String lastName;
    @Schema(description = "code")
    @NotBlank
    @Size(max = 50)
    private String code;
    @Schema(description = "beneficiary type")
    @NotNull
    private BeneficiaryType beneficiaryType;
    @Schema(description = "status")
    @NotNull
    private BeneficiaryStatus status;
    @Schema(description = "enrollment date")
    private LocalDate enrollmentDate;
    @Schema(description = "notes")
    @Size(max = 2000)
    private String notes;
}
