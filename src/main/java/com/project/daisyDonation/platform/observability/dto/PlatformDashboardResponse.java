package com.project.daisyDonation.platform.observability.dto;

import java.util.List;

import com.project.daisyDonation.organization.dto.OrganizationResponse;
import com.project.daisyDonation.platform.dto.PlatformStatsResponse;
import com.project.daisyDonation.platform.dto.PlatformUserResponse;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Unified platform owner dashboard with full cross-tenant access and system observability")
public class PlatformDashboardResponse {

    private PlatformStatsResponse platformStats;
    private long inactiveOrganizations;
    private long logsLast24Hours;
    private long errorsLast24Hours;
    private long securityEventsLast24Hours;
    private long unresolvedAlerts;
    private List<OrganizationResponse> organizations;
    private List<PlatformUserResponse> users;
    private List<SystemLogResponse> recentActivity;
    private List<SystemLogResponse> recentAlerts;
    private List<SystemLogResponse> recentErrors;
}
