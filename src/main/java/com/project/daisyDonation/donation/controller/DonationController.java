package com.project.daisyDonation.donation.controller;

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
import com.project.daisyDonation.donation.dto.DonationCreateRequest;
import com.project.daisyDonation.donation.dto.DonationDetailResponse;
import com.project.daisyDonation.donation.dto.DonationSummaryResponse;
import com.project.daisyDonation.donation.service.DonationService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/donations")
@RequiredArgsConstructor
@Tag(
        name = "Donations",
        description = "Donation intake and retrieval endpoints")
@SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
public class DonationController {

    private final DonationService donationService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ORG_ADMIN','FUNDRAISING_MANAGER','FINANCE_MANAGER','STAFF')")
    @Operation(
            summary = "Create donation",
            description = "Creates a donation entry for the authenticated organization.")
    public ResponseEntity<ApiResponse<DonationDetailResponse>> create(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody DonationCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Donation created", donationService.create(principal, request)));
    }

    @GetMapping
    @Operation(
            summary = "List donations",
            description = "Returns donation summaries for the authenticated organization.")
    public ResponseEntity<ApiResponse<List<DonationSummaryResponse>>> list(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.ok(donationService.list(principal)));
    }

    @GetMapping("/{id}")
    @Operation(
            summary = "Get donation by id",
            description = "Returns donation details for the provided donation identifier.")
    public ResponseEntity<ApiResponse<DonationDetailResponse>> getById(
            @AuthenticationPrincipal UserPrincipal principal,
            @Parameter(description = "Unique donation identifier")
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(donationService.getById(principal, id)));
    }

    @PostMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('ORG_ADMIN','FUNDRAISING_MANAGER','FINANCE_MANAGER')")
    @Operation(
            summary = "Cancel pending donation",
            description = "Cancels a pending donation that was never paid. Completed gifts cannot be cancelled here.")
    public ResponseEntity<ApiResponse<DonationDetailResponse>> cancel(
            @AuthenticationPrincipal UserPrincipal principal,
            @Parameter(description = "Unique donation identifier")
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("Donation cancelled", donationService.cancel(principal, id)));
    }
}
