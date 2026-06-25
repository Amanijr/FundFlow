package com.project.daisyDonation.collection.controller;

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

import com.project.daisyDonation.collection.dto.CollectionDashboardResponse;
import com.project.daisyDonation.collection.dto.CollectionSessionCountRequest;
import com.project.daisyDonation.collection.dto.CollectionSessionCreateRequest;
import com.project.daisyDonation.collection.dto.CollectionSessionResponse;
import com.project.daisyDonation.collection.service.CollectionSessionService;
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
@RequestMapping("/api/v1/collection-sessions")
@RequiredArgsConstructor
@Tag(name = "Collection Sessions", description = "Manage collection sessions and reconciliation lifecycle")
@SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
public class CollectionSessionController {

    private final CollectionSessionService collectionSessionService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ORG_ADMIN','FUNDRAISING_MANAGER','STAFF')")
    @Operation(
            summary = "Create collection session",
            description = "Creates a new collection session for recording offering/cash counts.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "201",
                    description = "Collection session created",
                    content = @Content(schema = @Schema(implementation = CollectionSessionResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "401",
                    description = "Unauthorized"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "403",
                    description = "Forbidden")
    })
    public ResponseEntity<ApiResponse<CollectionSessionResponse>> create(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CollectionSessionCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Collection session created",
                        collectionSessionService.create(principal, request)));
    }

    @GetMapping
    @Operation(
            summary = "List collection sessions",
            description = "Returns collection sessions for the authenticated organization context.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Collection sessions returned",
                    content = @Content(schema = @Schema(implementation = CollectionSessionResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "401",
                    description = "Unauthorized")
    })
    public ResponseEntity<ApiResponse<List<CollectionSessionResponse>>> list(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.ok(collectionSessionService.list(principal)));
    }

    @GetMapping("/dashboard")
    @Operation(
            summary = "Collection dashboard",
            description = "Returns collection-session KPIs and status summaries.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Collection dashboard returned",
                    content = @Content(schema = @Schema(implementation = CollectionDashboardResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "401",
                    description = "Unauthorized")
    })
    public ResponseEntity<ApiResponse<CollectionDashboardResponse>> dashboard(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.ok(collectionSessionService.getDashboard(principal)));
    }

    @GetMapping("/{id}")
    @Operation(
            summary = "Get collection session by ID",
            description = "Returns details for a specific collection session.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Collection session returned",
                    content = @Content(schema = @Schema(implementation = CollectionSessionResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "401",
                    description = "Unauthorized"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "404",
                    description = "Collection session not found")
    })
    public ResponseEntity<ApiResponse<CollectionSessionResponse>> getById(
            @AuthenticationPrincipal UserPrincipal principal,
            @Parameter(description = "Collection session ID") @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(collectionSessionService.getById(principal, id)));
    }

    @PutMapping("/{id}/count")
    @PreAuthorize("hasAnyRole('ORG_ADMIN','FUNDRAISING_MANAGER','STAFF')")
    @Operation(
            summary = "Submit collection count",
            description = "Submits denomination/count data for a collection session.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Collection count submitted",
                    content = @Content(schema = @Schema(implementation = CollectionSessionResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "401",
                    description = "Unauthorized"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "403",
                    description = "Forbidden"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "404",
                    description = "Collection session not found")
    })
    public ResponseEntity<ApiResponse<CollectionSessionResponse>> submitCount(
            @AuthenticationPrincipal UserPrincipal principal,
            @Parameter(description = "Collection session ID") @PathVariable Long id,
            @Valid @RequestBody CollectionSessionCountRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Collection count submitted",
                collectionSessionService.submitCount(principal, id, request)));
    }

    @PostMapping("/{id}/verify")
    @PreAuthorize("hasAnyRole('ORG_ADMIN','FINANCE_MANAGER')")
    @Operation(
            summary = "Verify collection session",
            description = "Marks a collection session as verified after finance review.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Collection session verified",
                    content = @Content(schema = @Schema(implementation = CollectionSessionResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "401",
                    description = "Unauthorized"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "403",
                    description = "Forbidden"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "404",
                    description = "Collection session not found")
    })
    public ResponseEntity<ApiResponse<CollectionSessionResponse>> verify(
            @AuthenticationPrincipal UserPrincipal principal,
            @Parameter(description = "Collection session ID") @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("Collection session verified",
                collectionSessionService.verify(principal, id)));
    }

    @PostMapping("/{id}/deposit")
    @PreAuthorize("hasAnyRole('ORG_ADMIN','FINANCE_MANAGER')")
    @Operation(
            summary = "Mark collection as deposited",
            description = "Marks a verified collection session as deposited.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Collection marked deposited",
                    content = @Content(schema = @Schema(implementation = CollectionSessionResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "401",
                    description = "Unauthorized"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "403",
                    description = "Forbidden"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "404",
                    description = "Collection session not found")
    })
    public ResponseEntity<ApiResponse<CollectionSessionResponse>> markDeposited(
            @AuthenticationPrincipal UserPrincipal principal,
            @Parameter(description = "Collection session ID") @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("Collection marked deposited",
                collectionSessionService.markDeposited(principal, id)));
    }
}
