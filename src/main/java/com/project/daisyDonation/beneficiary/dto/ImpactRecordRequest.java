package com.project.daisyDonation.beneficiary.dto;

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
@Schema(description = "Request payload for impact record")
public class ImpactRecordRequest {
    @Schema(description = "beneficiary id")
    private Long beneficiaryId;
    @Schema(description = "program id")
    private Long programId;
    @Schema(description = "title")
    @NotBlank
    @Size(max = 255)
    private String title;
    @Schema(description = "description")
    @Size(max = 2000)
    private String description;
    @Schema(description = "recorded date")
    @NotNull
    private LocalDate recordedDate;
    @Schema(description = "outcome metric")
    @Size(max = 255)
    private String outcomeMetric;
    @Schema(description = "outcome value")
    @Size(max = 255)
    private String outcomeValue;
}
