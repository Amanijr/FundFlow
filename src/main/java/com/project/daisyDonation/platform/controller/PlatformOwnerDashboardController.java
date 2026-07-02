package com.project.daisyDonation.platform.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.project.daisyDonation.auth.dto.CreateSuperAdminRequest;
import com.project.daisyDonation.auth.dto.UserResponse;
import com.project.daisyDonation.common.config.OpenApiConfig;
import com.project.daisyDonation.common.dto.ApiResponse;
import com.project.daisyDonation.common.security.UserPrincipal;
import com.project.daisyDonation.organization.dto.OrganizationResponse;
import com.project.daisyDonation.platform.dto.OrganizationStatusRequest;
import com.project.daisyDonation.platform.dto.PlatformStatsResponse;
import com.project.daisyDonation.platform.dto.PlatformUserResponse;
import com.project.daisyDonation.platform.observability.dto.PlatformDashboardResponse;
import com.project.daisyDonation.platform.observability.dto.SystemLogResponse;
import com.project.daisyDonation.platform.observability.entity.LogSeverity;
import com.project.daisyDonation.platform.observability.entity.LogType;
import com.project.daisyDonation.platform.service.PlatformOwnerDashboardService;
import com.project.daisyDonation.platform.service.PlatformService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/platform/dashboard")
@PreAuthorize("hasRole('SUPER_ADMIN')")
@SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
@RequiredArgsConstructor
@Tag(
        name = "Platform Owner Dashboard",
        description = """
                Unified super-admin control center with full platform access:
                tenant management, user directory, system logs, alerts, and observability.
                Use `X-Organization-Id` on other APIs to act within a specific tenant.
                """)
public class PlatformOwnerDashboardController {

    private final PlatformOwnerDashboardService dashboardService;
    private final PlatformService platformService;

    @GetMapping
    @Operation(
            summary = "Full platform owner dashboard",
            description = """
                    Returns everything the platform owner needs in one response:
                    statistics, all organizations, all users, recent activity,
                    alerts, errors, and 24-hour observability metrics.
                    """)
    public ResponseEntity<ApiResponse<PlatformDashboardResponse>> dashboard(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.ok(dashboardService.getDashboard(principal)));
    }

    @GetMapping("/stats")
    @Operation(summary = "Platform statistics", description = "Quick refresh of cross-tenant metrics.")
    public ResponseEntity<ApiResponse<PlatformStatsResponse>> stats(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.ok(platformService.stats(principal)));
    }

    @GetMapping("/organizations")
    @Operation(summary = "List organizations", description = "All tenants on the platform.")
    public ResponseEntity<ApiResponse<List<OrganizationResponse>>> listOrganizations(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.ok(dashboardService.listOrganizations(principal)));
    }

    @GetMapping("/organizations/{id}")
    @Operation(summary = "Get organization", description = "Organization details by ID.")
    public ResponseEntity<ApiResponse<OrganizationResponse>> getOrganization(
            @AuthenticationPrincipal UserPrincipal principal,
            @Parameter(description = "Organization identifier") @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(dashboardService.getOrganization(principal, id)));
    }

    @PutMapping("/organizations/{id}/status")
    @Operation(summary = "Update organization status", description = "Activate or deactivate a tenant.")
    public ResponseEntity<ApiResponse<OrganizationResponse>> updateOrganizationStatus(
            @AuthenticationPrincipal UserPrincipal principal,
            @Parameter(description = "Organization identifier") @PathVariable Long id,
            @Valid @RequestBody OrganizationStatusRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(
                "Organization status updated",
                dashboardService.updateOrganizationStatus(principal, id, request)));
    }

    @GetMapping("/users")
    @Operation(summary = "List all users", description = "Users across every organization plus super admins.")
    public ResponseEntity<ApiResponse<List<PlatformUserResponse>>> listUsers(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.ok(dashboardService.listUsers(principal)));
    }

    @PostMapping("/super-admins")
    @Operation(summary = "Create super admin", description = "Adds another platform owner account.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "201",
                    description = "Super administrator created",
                    content = @Content(schema = @Schema(implementation = UserResponse.class)))
    })
    public ResponseEntity<ApiResponse<UserResponse>> createSuperAdmin(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateSuperAdminRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Super administrator created",
                        dashboardService.createSuperAdmin(principal, request)));
    }

    @GetMapping("/logs")
    @Operation(
            summary = "Search system logs",
            description = "Platform-wide events, errors, exceptions, alerts, and security entries.")
    public ResponseEntity<ApiResponse<List<SystemLogResponse>>> searchLogs(
            @AuthenticationPrincipal UserPrincipal principal,
            @Parameter(description = "Filter by log type") @RequestParam(required = false) LogType type,
            @Parameter(description = "Filter by severity") @RequestParam(required = false) LogSeverity severity,
            @Parameter(description = "Filter by category (e.g. API, AUTH, PLATFORM)") @RequestParam(required = false) String category,
            @Parameter(description = "Filter by organization ID") @RequestParam(required = false) Long organizationId,
            @Parameter(description = "Return only unresolved alerts") @RequestParam(defaultValue = "false") boolean alertsOnly,
            @Parameter(description = "Start date (inclusive)") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @Parameter(description = "End date (inclusive)") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(ApiResponse.ok(
                dashboardService.searchLogs(principal, type, severity, category, organizationId, alertsOnly, from, to)));
    }

    @GetMapping("/logs/{id}")
    @Operation(summary = "Get system log entry", description = "Single log entry with full detail.")
    public ResponseEntity<ApiResponse<SystemLogResponse>> getLog(
            @AuthenticationPrincipal UserPrincipal principal,
            @Parameter(description = "System log entry ID") @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(dashboardService.getLog(principal, id)));
    }

    @PutMapping("/logs/{id}/resolve")
    @Operation(summary = "Resolve alert", description = "Marks an alert as handled by the platform owner.")
    public ResponseEntity<ApiResponse<SystemLogResponse>> resolveAlert(
            @AuthenticationPrincipal UserPrincipal principal,
            @Parameter(description = "Alert log entry ID") @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("Alert resolved", dashboardService.resolveAlert(principal, id)));
    }
}
