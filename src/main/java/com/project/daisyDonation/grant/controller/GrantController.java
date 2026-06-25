package com.project.daisyDonation.grant.controller;

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
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.project.daisyDonation.common.config.OpenApiConfig;
import com.project.daisyDonation.common.dto.ApiResponse;
import com.project.daisyDonation.common.security.UserPrincipal;
import com.project.daisyDonation.grant.dto.GrantComplianceRequest;
import com.project.daisyDonation.grant.dto.GrantRequest;
import com.project.daisyDonation.grant.dto.GrantResponse;
import com.project.daisyDonation.grant.dto.GrantUtilizationResponse;
import com.project.daisyDonation.grant.service.GrantService;

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
@RequestMapping("/api/v1/grants")
@RequiredArgsConstructor
@Tag(name = "Grants", description = "Grant management, compliance tracking, and utilization reporting")
@SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
public class GrantController {

    private final GrantService grantService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ORG_ADMIN','FINANCE_MANAGER','PROGRAM_MANAGER')")
    @Operation(
            summary = "Create grant",
            description = "Creates a new grant record with budget, donor, and timeline details.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "201",
                    description = "Grant created",
                    content = @Content(schema = @Schema(implementation = GrantResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "400",
                    description = "Invalid request payload"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "401",
                    description = "Unauthorized"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "403",
                    description = "Forbidden")
    })
    public ResponseEntity<ApiResponse<GrantResponse>> create(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody GrantRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Grant created", grantService.create(principal, request)));
    }

    @GetMapping
    @Operation(
            summary = "List grants",
            description = "Returns all grants available to the authenticated organization.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Grants list",
                    content = @Content(schema = @Schema(implementation = GrantResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "401",
                    description = "Unauthorized")
    })
    public ResponseEntity<ApiResponse<List<GrantResponse>>> list(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.ok(grantService.list(principal)));
    }

    @GetMapping("/{id}")
    @Operation(
            summary = "Get grant",
            description = "Fetches a single grant by identifier.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Grant details",
                    content = @Content(schema = @Schema(implementation = GrantResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "401",
                    description = "Unauthorized"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "404",
                    description = "Grant not found")
    })
    public ResponseEntity<ApiResponse<GrantResponse>> getById(
            @AuthenticationPrincipal UserPrincipal principal,
            @Parameter(description = "Grant identifier")
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(grantService.getById(principal, id)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ORG_ADMIN','FINANCE_MANAGER','PROGRAM_MANAGER')")
    @Operation(
            summary = "Update grant",
            description = "Updates an existing grant by identifier.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Grant updated",
                    content = @Content(schema = @Schema(implementation = GrantResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "400",
                    description = "Invalid request payload"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "401",
                    description = "Unauthorized"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "403",
                    description = "Forbidden"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "404",
                    description = "Grant not found")
    })
    public ResponseEntity<ApiResponse<GrantResponse>> update(
            @AuthenticationPrincipal UserPrincipal principal,
            @Parameter(description = "Grant identifier")
            @PathVariable Long id,
            @Valid @RequestBody GrantRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Grant updated", grantService.update(principal, id, request)));
    }

    @PostMapping("/{id}/activate")
    @PreAuthorize("hasAnyRole('ORG_ADMIN','FINANCE_MANAGER')")
    @Operation(
            summary = "Activate grant",
            description = "Transitions a grant to active status.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Grant activated",
                    content = @Content(schema = @Schema(implementation = GrantResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "401",
                    description = "Unauthorized"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "403",
                    description = "Forbidden"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "404",
                    description = "Grant not found")
    })
    public ResponseEntity<ApiResponse<GrantResponse>> activate(
            @AuthenticationPrincipal UserPrincipal principal,
            @Parameter(description = "Grant identifier")
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("Grant activated", grantService.activate(principal, id)));
    }

    @PostMapping("/{id}/close")
    @PreAuthorize("hasAnyRole('ORG_ADMIN','FINANCE_MANAGER')")
    @Operation(
            summary = "Close grant",
            description = "Transitions a grant to closed status.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Grant closed",
                    content = @Content(schema = @Schema(implementation = GrantResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "401",
                    description = "Unauthorized"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "403",
                    description = "Forbidden"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "404",
                    description = "Grant not found")
    })
    public ResponseEntity<ApiResponse<GrantResponse>> close(
            @AuthenticationPrincipal UserPrincipal principal,
            @Parameter(description = "Grant identifier")
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("Grant closed", grantService.close(principal, id)));
    }

    @PostMapping("/{id}/compliance")
    @PreAuthorize("hasAnyRole('ORG_ADMIN','FINANCE_MANAGER','PROGRAM_MANAGER')")
    @Operation(
            summary = "Record grant compliance",
            description = "Captures a compliance update for the selected grant.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Compliance recorded",
                    content = @Content(schema = @Schema(implementation = GrantResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "400",
                    description = "Invalid request payload"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "401",
                    description = "Unauthorized"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "403",
                    description = "Forbidden"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "404",
                    description = "Grant not found")
    })
    public ResponseEntity<ApiResponse<GrantResponse>> recordCompliance(
            @AuthenticationPrincipal UserPrincipal principal,
            @Parameter(description = "Grant identifier")
            @PathVariable Long id,
            @Valid @RequestBody GrantComplianceRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(
                "Compliance recorded", grantService.recordCompliance(principal, id, request)));
    }

    @GetMapping("/{id}/utilization")
    @Operation(
            summary = "Grant utilization",
            description = "Returns budget utilization and spending status for the selected grant.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Grant utilization",
                    content = @Content(schema = @Schema(implementation = GrantUtilizationResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "401",
                    description = "Unauthorized"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "404",
                    description = "Grant not found")
    })
    public ResponseEntity<ApiResponse<GrantUtilizationResponse>> utilization(
            @AuthenticationPrincipal UserPrincipal principal,
            @Parameter(description = "Grant identifier")
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(grantService.getUtilization(principal, id)));
    }
}
