package com.project.daisyDonation.school.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import com.project.daisyDonation.school.entity.SponsorshipStatus;

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
@Schema(description = "Request payload for student sponsorship")
public class StudentSponsorshipRequest {
    @Schema(description = "beneficiary id")
    @NotNull
    private Long beneficiaryId;
    @Schema(description = "donor id")
    @NotNull
    private Long donorId;
    @Schema(description = "academic year")
    @NotBlank
    @Size(max = 20)
    private String academicYear;
    @Schema(description = "term")
    @Size(max = 50)
    private String term;
    @Schema(description = "amount")
    @NotNull
    @DecimalMin(value = "0.01")
    private BigDecimal amount;
    @Schema(description = "status")
    @NotNull
    private SponsorshipStatus status;
    @Schema(description = "start date")
    private LocalDate startDate;
    @Schema(description = "end date")
    private LocalDate endDate;
    @Schema(description = "notes")
    @Size(max = 1000)
    private String notes;
}
