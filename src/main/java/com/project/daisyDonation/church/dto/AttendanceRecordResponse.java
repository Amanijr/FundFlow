package com.project.daisyDonation.church.dto;

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
@Schema(description = "Response payload for attendance record")
public class AttendanceRecordResponse {

    private Long id;
    private Long ministryId;
    private String ministryName;
    private LocalDate serviceDate;
    private String eventName;
    private int attendanceCount;
    private String notes;
    private Long recordedByUserId;
    private LocalDateTime createdAt;
}
