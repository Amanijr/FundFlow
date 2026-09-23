package com.project.daisyDonation.church.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceEventResponse {

    private Long id;
    private String name;
    private LocalDate serviceDate;
    private LocalTime startsAt;
    private String location;
    private Long ministryId;
    private String ministryName;
    private String notes;
    private Long attendanceId;
    private Integer attendanceCount;
    private LocalDateTime createdAt;
}
