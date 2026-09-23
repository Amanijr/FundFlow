package com.project.daisyDonation.church.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChurchDashboardResponse {

    private long memberCount;
    private long activeMemberCount;
    private BigDecimal fundsRemaining;
    private BigDecimal givingThisYear;
    private long collectionsNeedingAction;
    private long attendanceThisYear;
    private String lastServiceName;
    private LocalDate lastServiceDate;
    private Integer lastAttendanceCount;
}
