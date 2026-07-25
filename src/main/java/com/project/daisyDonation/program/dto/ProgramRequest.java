package com.project.daisyDonation.program.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDate;

import com.project.daisyDonation.program.entity.ProgramStatus;

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
@Schema(description = "Request payload for program")
public class ProgramRequest {
    @Schema(description = "name")
    @NotBlank
    @Size(max = 255)
    private String name;
    @Schema(description = "code")
    @NotBlank
    @Size(max = 50)
    private String code;
    @Schema(description = "description")
    @Size(max = 2000)
    private String description;
    @Schema(description = "status")
    @NotNull
    private ProgramStatus status;
    @Schema(description = "start date")
    private LocalDate startDate;
    @Schema(description = "end date")
    private LocalDate endDate;
    @Schema(description = "fund id")
    private Long fundId;
}
