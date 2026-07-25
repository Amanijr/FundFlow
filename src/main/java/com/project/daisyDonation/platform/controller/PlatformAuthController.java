package com.project.daisyDonation.platform.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.project.daisyDonation.auth.dto.AuthResponse;
import com.project.daisyDonation.auth.dto.LoginRequest;
import com.project.daisyDonation.auth.dto.UserResponse;
import com.project.daisyDonation.common.config.OpenApiConfig;
import com.project.daisyDonation.common.dto.ApiResponse;
import com.project.daisyDonation.common.security.UserPrincipal;
import com.project.daisyDonation.platform.service.PlatformAuthService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/platform/auth")
@RequiredArgsConstructor
@Tag(name = "Platform Authentication", description = "Dedicated authentication plane for platform owners")
public class PlatformAuthController {

    private final PlatformAuthService platformAuthService;

    @PostMapping("/login")
    @Operation(
            summary = "Platform owner login",
            description = "Authenticates a SUPER_ADMIN and returns a platform-scoped access token.")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(platformAuthService.login(request)));
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
    @Operation(summary = "Current platform owner", description = "Returns the authenticated platform owner profile.")
    public ResponseEntity<ApiResponse<UserResponse>> me(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.ok(platformAuthService.getCurrentUser(principal)));
    }

    @PostMapping("/impersonate/{organizationId}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
    @Operation(
            summary = "Start tenant impersonation",
            description = "Issues a short-lived impersonation token for tenant APIs. Requires a platform token.")
    public ResponseEntity<ApiResponse<AuthResponse>> impersonate(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long organizationId) {
        return ResponseEntity.ok(ApiResponse.ok(
                "Impersonation token issued",
                platformAuthService.impersonate(principal, organizationId)));
    }
}
