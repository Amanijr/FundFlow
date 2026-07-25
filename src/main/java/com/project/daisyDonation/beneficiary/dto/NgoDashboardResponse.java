package com.project.daisyDonation.beneficiary.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Response payload for ngo dashboard")
public class NgoDashboardResponse {

    private long beneficiaryCount;
    private long impactRecordCount;
    private long activeBeneficiaryCount;
}
