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
@Schema(description = "Platform-wide statistics for super administrators")
public class PlatformStatsResponse {

    @Schema(description = "Total registered organizations", example = "12")
    private long totalOrganizations;

    @Schema(description = "Active organizations", example = "10")
    private long activeOrganizations;

    @Schema(description = "Total users across all organizations", example = "48")
    private long totalUsers;

    @Schema(description = "Platform super administrator accounts", example = "2")
    private long superAdminCount;
}
