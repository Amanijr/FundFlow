package com.project.daisyDonation.beneficiary.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDate;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Response payload for impact record")
public class ImpactRecordResponse {

    private Long id;
    private Long beneficiaryId;
    private String beneficiaryName;
    private Long programId;
    private String programName;
    private String title;
    private String description;
    private LocalDate recordedDate;
    private String outcomeMetric;
    private String outcomeValue;
    private LocalDateTime createdAt;
}
