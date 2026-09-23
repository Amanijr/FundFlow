package com.project.daisyDonation.church.dto;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PartnershipMonthProgress {

    private int year;
    private int month;
    private String yearMonth;
    private BigDecimal expected;
    private BigDecimal received;
    private String status;
}
