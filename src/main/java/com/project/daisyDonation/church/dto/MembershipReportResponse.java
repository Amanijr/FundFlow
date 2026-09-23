package com.project.daisyDonation.church.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MembershipReportResponse {

    private long total;
    private long active;
    private long inactive;
    private long visitors;
}
