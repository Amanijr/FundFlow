package com.project.daisyDonation.platform.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Request to activate or deactivate an organization")
public class OrganizationStatusRequest {

    @Schema(description = "whether the organization is active", example = "true")
    private boolean active;
}
