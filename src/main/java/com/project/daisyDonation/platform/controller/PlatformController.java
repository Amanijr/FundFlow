package com.project.daisyDonation.platform.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.project.daisyDonation.auth.dto.AuthResponse;
import com.project.daisyDonation.auth.dto.BootstrapSuperAdminRequest;
import com.project.daisyDonation.auth.dto.CreateSuperAdminRequest;
import com.project.daisyDonation.auth.dto.UserResponse;
import com.project.daisyDonation.common.config.OpenApiConfig;
import com.project.daisyDonation.common.dto.ApiResponse;
import com.project.daisyDonation.common.security.UserPrincipal;
import com.project.daisyDonation.organization.dto.OrganizationResponse;
import com.project.daisyDonation.platform.dto.OrganizationStatusRequest;
import com.project.daisyDonation.platform.dto.PlatformStatsResponse;
import com.project.daisyDonation.platform.dto.PlatformUserResponse;
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
@RequestMapping("/api/v1/platform")
@RequiredArgsConstructor
@Tag(name = "Platform", description = "Platform-wide super administrator operations")
public class PlatformController {

    private final PlatformService platformService;

    @PostMapping("/bootstrap")
    @Operation(
            summary = "Bootstrap first super admin",
            description = """
                    Creates the first platform super administrator when none exists.
                    Requires the `X-Platform-Bootstrap-Secret` header matching `app.platform.bootstrap-secret`.
                    """)
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "201",
                    description = "Super administrator created",
                    content = @Content(schema = @Schema(implementation = AuthResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Bootstrap unavailable or super admin exists"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Invalid bootstrap secret")
    })
    public ResponseEntity<ApiResponse<AuthResponse>> bootstrapSuperAdmin(
            @Parameter(description = "Bootstrap secret configured in application properties")
            @RequestHeader("X-Platform-Bootstrap-Secret") String bootstrapSecret,
            @Valid @RequestBody BootstrapSuperAdminRequest request) {
        AuthResponse response = platformService.bootstrapSuperAdmin(bootstrapSecret, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Super administrator created", response));
    }

    @PostMapping("/super-admins")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
    @Operation(
            summary = "Create super admin",
            description = "Creates an additional platform super administrator account.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "201",
                    description = "Super administrator created",
                    content = @Content(schema = @Schema(implementation = UserResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden")
    })
    public ResponseEntity<ApiResponse<UserResponse>> createSuperAdmin(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateSuperAdminRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Super administrator created",
                        platformService.createSuperAdmin(principal, request)));
    }

    @GetMapping("/stats")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
    @Operation(summary = "Platform statistics", description = "Returns cross-tenant platform metrics.")
    public ResponseEntity<ApiResponse<PlatformStatsResponse>> stats(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.ok(platformService.stats(principal)));
    }

    @GetMapping("/organizations")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
    @Operation(summary = "List organizations", description = "Lists all organizations on the platform.")
    public ResponseEntity<ApiResponse<List<OrganizationResponse>>> listOrganizations(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.ok(platformService.listOrganizations(principal)));
    }

    @GetMapping("/organizations/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
    @Operation(summary = "Get organization", description = "Returns any organization by ID.")
    public ResponseEntity<ApiResponse<OrganizationResponse>> getOrganization(
            @AuthenticationPrincipal UserPrincipal principal,
            @Parameter(description = "Organization identifier")
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(platformService.getOrganization(principal, id)));
    }

    @PutMapping("/organizations/{id}/status")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
    @Operation(summary = "Update organization status", description = "Activates or deactivates an organization.")
    public ResponseEntity<ApiResponse<OrganizationResponse>> updateOrganizationStatus(
            @AuthenticationPrincipal UserPrincipal principal,
            @Parameter(description = "Organization identifier")
            @PathVariable Long id,
            @Valid @RequestBody OrganizationStatusRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(
                "Organization status updated",
                platformService.updateOrganizationStatus(principal, id, request)));
    }

    @GetMapping("/users")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
    @Operation(summary = "List all users", description = "Lists users across all organizations.")
    public ResponseEntity<ApiResponse<List<PlatformUserResponse>>> listUsers(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.ok(platformService.listUsers(principal)));
    }
}
