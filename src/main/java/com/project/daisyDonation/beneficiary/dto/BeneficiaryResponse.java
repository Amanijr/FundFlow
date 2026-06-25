package com.project.daisyDonation.beneficiary.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.project.daisyDonation.beneficiary.entity.BeneficiaryStatus;
import com.project.daisyDonation.beneficiary.entity.BeneficiaryType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Response payload for beneficiary")
public class BeneficiaryResponse {

    private Long id;
    private String firstName;
    private String lastName;
    private String code;
    private BeneficiaryType beneficiaryType;
    private BeneficiaryStatus status;
    private LocalDate enrollmentDate;
    private String notes;
    private LocalDateTime createdAt;
}
