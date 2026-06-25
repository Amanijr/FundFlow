package com.project.daisyDonation.beneficiary.controller;

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

import com.project.daisyDonation.beneficiary.dto.BeneficiaryRequest;
import com.project.daisyDonation.beneficiary.dto.BeneficiaryResponse;
import com.project.daisyDonation.beneficiary.dto.ImpactRecordRequest;
import com.project.daisyDonation.beneficiary.dto.ImpactRecordResponse;
import com.project.daisyDonation.beneficiary.dto.NgoDashboardResponse;
import com.project.daisyDonation.beneficiary.service.BeneficiaryService;
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
@RequestMapping("/api/v1/beneficiaries")
@RequiredArgsConstructor
@Tag(name = "Beneficiaries", description = "Beneficiary registration, impact tracking, and NGO dashboard operations")
@SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
public class BeneficiaryController {

    private final BeneficiaryService beneficiaryService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ORG_ADMIN','FINANCE_MANAGER','PROGRAM_MANAGER','STAFF')")
    @Operation(
            summary = "Create beneficiary",
            description = "Registers a new beneficiary profile.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "201",
                    description = "Beneficiary created",
                    content = @Content(schema = @Schema(implementation = BeneficiaryResponse.class))),
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
    public ResponseEntity<ApiResponse<BeneficiaryResponse>> create(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody BeneficiaryRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Beneficiary created", beneficiaryService.create(principal, request)));
    }

    @GetMapping
    @Operation(
            summary = "List beneficiaries",
            description = "Returns all beneficiaries available to the authenticated organization.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Beneficiaries list",
                    content = @Content(schema = @Schema(implementation = BeneficiaryResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "401",
                    description = "Unauthorized")
    })
    public ResponseEntity<ApiResponse<List<BeneficiaryResponse>>> list(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.ok(beneficiaryService.list(principal)));
    }

    @GetMapping("/dashboard")
    @Operation(
            summary = "NGO dashboard",
            description = "Returns beneficiary and impact KPIs for dashboard reporting.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "NGO dashboard",
                    content = @Content(schema = @Schema(implementation = NgoDashboardResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "401",
                    description = "Unauthorized")
    })
    public ResponseEntity<ApiResponse<NgoDashboardResponse>> dashboard(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.ok(beneficiaryService.dashboard(principal)));
    }

    @GetMapping("/impact")
    @Operation(
            summary = "List impact records",
            description = "Returns all recorded impact entries for the organization.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Impact records",
                    content = @Content(schema = @Schema(implementation = ImpactRecordResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "401",
                    description = "Unauthorized")
    })
    public ResponseEntity<ApiResponse<List<ImpactRecordResponse>>> listImpact(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.ok(beneficiaryService.listImpact(principal)));
    }

    @GetMapping("/{id}")
    @Operation(
            summary = "Get beneficiary",
            description = "Fetches a beneficiary by identifier.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Beneficiary details",
                    content = @Content(schema = @Schema(implementation = BeneficiaryResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "401",
                    description = "Unauthorized"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "404",
                    description = "Beneficiary not found")
    })
    public ResponseEntity<ApiResponse<BeneficiaryResponse>> getById(
            @AuthenticationPrincipal UserPrincipal principal,
            @Parameter(description = "Beneficiary identifier")
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(beneficiaryService.getById(principal, id)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ORG_ADMIN','FINANCE_MANAGER','PROGRAM_MANAGER','STAFF')")
    @Operation(
            summary = "Update beneficiary",
            description = "Updates an existing beneficiary record.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Beneficiary updated",
                    content = @Content(schema = @Schema(implementation = BeneficiaryResponse.class))),
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
                    description = "Beneficiary not found")
    })
    public ResponseEntity<ApiResponse<BeneficiaryResponse>> update(
            @AuthenticationPrincipal UserPrincipal principal,
            @Parameter(description = "Beneficiary identifier")
            @PathVariable Long id,
            @Valid @RequestBody BeneficiaryRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Beneficiary updated", beneficiaryService.update(principal, id, request)));
    }

    @PostMapping("/impact")
    @PreAuthorize("hasAnyRole('ORG_ADMIN','FINANCE_MANAGER','PROGRAM_MANAGER','STAFF')")
    @Operation(
            summary = "Record impact",
            description = "Creates a new impact record for beneficiary outcomes.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "201",
                    description = "Impact recorded",
                    content = @Content(schema = @Schema(implementation = ImpactRecordResponse.class))),
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
    public ResponseEntity<ApiResponse<ImpactRecordResponse>> recordImpact(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody ImpactRecordRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Impact recorded", beneficiaryService.recordImpact(principal, request)));
    }

    @GetMapping("/{id}/impact")
    @Operation(
            summary = "List beneficiary impact",
            description = "Returns impact history for a specific beneficiary.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Beneficiary impact records",
                    content = @Content(schema = @Schema(implementation = ImpactRecordResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "401",
                    description = "Unauthorized"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "404",
                    description = "Beneficiary not found")
    })
    public ResponseEntity<ApiResponse<List<ImpactRecordResponse>>> listImpactForBeneficiary(
            @AuthenticationPrincipal UserPrincipal principal,
            @Parameter(description = "Beneficiary identifier")
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(beneficiaryService.listImpactForBeneficiary(principal, id)));
    }
}
