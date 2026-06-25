package com.project.daisyDonation.school.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import com.project.daisyDonation.school.entity.SponsorshipStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Response payload for student sponsorship")
public class StudentSponsorshipResponse {

    private Long id;
    private Long beneficiaryId;
    private String beneficiaryName;
    private Long donorId;
    private String donorName;
    private String academicYear;
    private String term;
    private BigDecimal amount;
    private SponsorshipStatus status;
    private LocalDate startDate;
    private LocalDate endDate;
    private String notes;
    private LocalDateTime createdAt;
}
