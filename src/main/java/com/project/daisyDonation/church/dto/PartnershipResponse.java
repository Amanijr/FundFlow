package com.project.daisyDonation.church.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import com.project.daisyDonation.church.entity.PartnershipStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PartnershipResponse {

    private Long id;
    private Long memberId;
    private String memberName;
    private String memberNumber;
    private Long fundId;
    private String fundName;
    private BigDecimal monthlyAmount;
    private LocalDate startDate;
    private LocalDate endDate;
    private PartnershipStatus status;
    private String notes;
    private LocalDateTime createdAt;
    private BigDecimal thisMonthExpected;
    private BigDecimal thisMonthReceived;
    private String thisMonthStatus;
    private BigDecimal thisYearExpected;
    private BigDecimal thisYearReceived;
    private List<PartnershipMonthProgress> months;
}
