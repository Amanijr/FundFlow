package com.project.daisyDonation.church.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Response payload for attendance summary")
public class AttendanceSummaryResponse {

    private LocalDate fromDate;
    private LocalDate toDate;
    private long totalAttendance;
    private long recordCount;
}
