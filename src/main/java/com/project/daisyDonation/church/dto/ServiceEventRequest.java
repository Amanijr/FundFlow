package com.project.daisyDonation.church.dto;

import java.time.LocalDate;
import java.time.LocalTime;

import io.swagger.v3.oas.annotations.media.Schema;
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
@Schema(description = "Create or update a church service or event")
public class ServiceEventRequest {

    @NotBlank
    @Size(max = 255)
    private String name;

    @NotNull
    private LocalDate serviceDate;

    private LocalTime startsAt;

    @Size(max = 255)
    private String location;

    private Long ministryId;

    @Size(max = 1000)
    private String notes;
}
