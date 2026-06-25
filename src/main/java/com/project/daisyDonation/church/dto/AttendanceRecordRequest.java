package com.project.daisyDonation.church.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDate;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Request payload for attendance record")
public class AttendanceRecordRequest {
    @Schema(description = "ministry id")
    private Long ministryId;
    @Schema(description = "service date")
    @NotNull
    private LocalDate serviceDate;
    @Schema(description = "event name")
    @NotBlank
    @Size(max = 255)
    private String eventName;
    @Schema(description = "attendance count")
    @Min(0)
    private int attendanceCount;
    @Schema(description = "notes")
    @Size(max = 1000)
    private String notes;
}
