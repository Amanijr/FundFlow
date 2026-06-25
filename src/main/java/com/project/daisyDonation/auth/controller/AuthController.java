package com.project.daisyDonation.auth.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.project.daisyDonation.auth.dto.AuthResponse;
import com.project.daisyDonation.auth.dto.LoginRequest;
import com.project.daisyDonation.auth.dto.RegisterRequest;
import com.project.daisyDonation.auth.dto.UserResponse;
import com.project.daisyDonation.auth.service.AuthService;
import com.project.daisyDonation.common.config.OpenApiConfig;
import com.project.daisyDonation.common.dto.ApiResponse;
import com.project.daisyDonation.common.security.UserPrincipal;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(
        name = "Authentication",
        description = "Public authentication endpoints and current user profile")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @Operation(
            summary = "Register organization",
            description = "Registers a new organization account and returns authentication details.")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Organization registered successfully", response));
    }

    @PostMapping("/login")
    @Operation(
            summary = "Login user",
            description = "Authenticates an existing user and returns access credentials.")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(authService.login(request)));
    }

    @GetMapping("/me")
    @Operation(
            summary = "Get current user",
            description = "Returns the authenticated user profile tied to the bearer token.")
    @SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
    public ResponseEntity<ApiResponse<UserResponse>> me(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.ok(authService.getCurrentUser(principal)));
    }
}
