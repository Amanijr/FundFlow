package com.project.daisyDonation.organization.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.project.daisyDonation.common.config.OpenApiConfig;
import com.project.daisyDonation.common.dto.ApiResponse;
import com.project.daisyDonation.common.security.UserPrincipal;
import com.project.daisyDonation.organization.dto.OrganizationRequest;
import com.project.daisyDonation.organization.dto.OrganizationResponse;
import com.project.daisyDonation.organization.service.OrganizationService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/organizations")
@RequiredArgsConstructor
@Tag(
        name = "Organization",
        description = "Organization profile and administration endpoints")
@SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
public class OrganizationController {

    private final OrganizationService organizationService;

    @GetMapping("/me")
    @Operation(
            summary = "Get current organization",
            description = "Returns organization details associated with the authenticated user.")
    public ResponseEntity<ApiResponse<OrganizationResponse>> getCurrentOrganization(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.ok(organizationService.getCurrentOrganization(principal)));
    }

    @PutMapping("/me")
    @PreAuthorize("hasRole('ORG_ADMIN')")
    @Operation(
            summary = "Update current organization",
            description = "Updates organization profile information for the authenticated organization.")
    public ResponseEntity<ApiResponse<OrganizationResponse>> updateCurrentOrganization(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody OrganizationRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(
                "Organization updated successfully",
                organizationService.updateCurrentOrganization(principal, request)));
    }
}
