package com.project.daisyDonation.campaign.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.project.daisyDonation.campaign.dto.CampaignDashboardResponse;
import com.project.daisyDonation.campaign.dto.CampaignRequest;
import com.project.daisyDonation.campaign.dto.CampaignResponse;
import com.project.daisyDonation.campaign.service.CampaignService;
import com.project.daisyDonation.common.config.OpenApiConfig;
import com.project.daisyDonation.common.dto.ApiResponse;
import com.project.daisyDonation.common.security.UserPrincipal;

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
@RequestMapping("/api/v1/campaigns")
@RequiredArgsConstructor
@Tag(name = "Campaigns", description = "Create, monitor, and manage fundraising campaigns")
@SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
public class CampaignController {

    private final CampaignService campaignService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ORG_ADMIN','FUNDRAISING_MANAGER','STAFF')")
    @Operation(
            summary = "Create campaign",
            description = "Creates a new fundraising campaign.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "201",
                    description = "Campaign created",
                    content = @Content(schema = @Schema(implementation = CampaignResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "401",
                    description = "Unauthorized"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "403",
                    description = "Forbidden")
    })
    public ResponseEntity<ApiResponse<CampaignResponse>> create(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CampaignRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Campaign created", campaignService.create(principal, request)));
    }

    @GetMapping
    @Operation(
            summary = "List campaigns",
            description = "Returns campaigns visible to the authenticated organization context.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Campaigns returned",
                    content = @Content(schema = @Schema(implementation = CampaignResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "401",
                    description = "Unauthorized")
    })
    public ResponseEntity<ApiResponse<List<CampaignResponse>>> list(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.ok(campaignService.list(principal)));
    }

    @GetMapping("/{id}")
    @Operation(
            summary = "Get campaign by ID",
            description = "Returns details for a specific campaign.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Campaign returned",
                    content = @Content(schema = @Schema(implementation = CampaignResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "401",
                    description = "Unauthorized"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "404",
                    description = "Campaign not found")
    })
    public ResponseEntity<ApiResponse<CampaignResponse>> getById(
            @AuthenticationPrincipal UserPrincipal principal,
            @Parameter(description = "Campaign ID") @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(campaignService.getById(principal, id)));
    }

    @GetMapping("/{id}/dashboard")
    @Operation(
            summary = "Campaign dashboard",
            description = "Returns KPI metrics and progress details for a campaign.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Campaign dashboard returned",
                    content = @Content(schema = @Schema(implementation = CampaignDashboardResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "401",
                    description = "Unauthorized"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "404",
                    description = "Campaign not found")
    })
    public ResponseEntity<ApiResponse<CampaignDashboardResponse>> getDashboard(
            @AuthenticationPrincipal UserPrincipal principal,
            @Parameter(description = "Campaign ID") @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(campaignService.getDashboard(principal, id)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ORG_ADMIN','FUNDRAISING_MANAGER','STAFF')")
    @Operation(
            summary = "Update campaign",
            description = "Updates an existing campaign.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Campaign updated",
                    content = @Content(schema = @Schema(implementation = CampaignResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "401",
                    description = "Unauthorized"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "403",
                    description = "Forbidden"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "404",
                    description = "Campaign not found")
    })
    public ResponseEntity<ApiResponse<CampaignResponse>> update(
            @AuthenticationPrincipal UserPrincipal principal,
            @Parameter(description = "Campaign ID") @PathVariable Long id,
            @Valid @RequestBody CampaignRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Campaign updated", campaignService.update(principal, id, request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ORG_ADMIN','FUNDRAISING_MANAGER')")
    @Operation(
            summary = "Delete campaign",
            description = "Deletes a campaign by ID.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Campaign deleted"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "401",
                    description = "Unauthorized"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "403",
                    description = "Forbidden"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "404",
                    description = "Campaign not found")
    })
    public ResponseEntity<ApiResponse<Void>> delete(
            @AuthenticationPrincipal UserPrincipal principal,
            @Parameter(description = "Campaign ID") @PathVariable Long id) {
        campaignService.delete(principal, id);
        return ResponseEntity.ok(ApiResponse.ok("Campaign deleted", null));
    }
}
