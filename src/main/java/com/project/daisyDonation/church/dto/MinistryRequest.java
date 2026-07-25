package com.project.daisyDonation.church.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Request payload for ministry")
public class MinistryRequest {
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
    @Schema(description = "leader name")
    @Size(max = 255)
    private String leaderName;
    private boolean active = true;
}
