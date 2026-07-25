package com.project.daisyDonation.program.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.project.daisyDonation.program.entity.ProgramStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Response payload for program")
public class ProgramResponse {

    private Long id;
    private String name;
    private String code;
    private String description;
    private ProgramStatus status;
    private LocalDate startDate;
    private LocalDate endDate;
    private Long fundId;
    private String fundName;
    private LocalDateTime createdAt;
}
