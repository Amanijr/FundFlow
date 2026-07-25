package com.project.daisyDonation.pledge.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.project.daisyDonation.common.config.OpenApiConfig;
import com.project.daisyDonation.common.dto.ApiResponse;
import com.project.daisyDonation.common.security.UserPrincipal;
import com.project.daisyDonation.pledge.dto.PledgeRequest;
import com.project.daisyDonation.pledge.dto.PledgeResponse;
import com.project.daisyDonation.pledge.service.PledgeService;

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
@RequestMapping("/api/v1/pledges")
@RequiredArgsConstructor
@Tag(name = "Pledges", description = "Create and manage donor pledge commitments")
@SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
public class PledgeController {

    private final PledgeService pledgeService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ORG_ADMIN','FUNDRAISING_MANAGER','STAFF')")
    @Operation(
            summary = "Create pledge",
            description = "Creates a new pledge commitment linked to a donor and optional campaign.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "201",
                    description = "Pledge created",
                    content = @Content(schema = @Schema(implementation = PledgeResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "401",
                    description = "Unauthorized"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "403",
                    description = "Forbidden")
    })
    public ResponseEntity<ApiResponse<PledgeResponse>> create(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody PledgeRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Pledge created", pledgeService.create(principal, request)));
    }

    @GetMapping
    @Operation(
            summary = "List pledges",
            description = "Returns all pledges accessible to the authenticated organization context.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Pledges returned",
                    content = @Content(schema = @Schema(implementation = PledgeResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "401",
                    description = "Unauthorized")
    })
    public ResponseEntity<ApiResponse<List<PledgeResponse>>> list(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.ok(pledgeService.list(principal)));
    }

    @GetMapping("/{id}")
    @Operation(
            summary = "Get pledge by ID",
            description = "Returns details for a specific pledge.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Pledge returned",
                    content = @Content(schema = @Schema(implementation = PledgeResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "401",
                    description = "Unauthorized"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "404",
                    description = "Pledge not found")
    })
    public ResponseEntity<ApiResponse<PledgeResponse>> getById(
            @AuthenticationPrincipal UserPrincipal principal,
            @Parameter(description = "Pledge ID") @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(pledgeService.getById(principal, id)));
    }
}
