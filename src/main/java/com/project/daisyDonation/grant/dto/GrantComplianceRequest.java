package com.project.daisyDonation.grant.dto;

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
@Schema(description = "Request payload for grant compliance")
public class GrantComplianceRequest {
    @Schema(description = "compliance notes")
    @NotBlank
    @Size(max = 2000)
    private String complianceNotes;
}
