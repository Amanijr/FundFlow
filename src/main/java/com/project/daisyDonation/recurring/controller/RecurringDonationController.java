package com.project.daisyDonation.recurring.controller;

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
import com.project.daisyDonation.common.exception.BadRequestException;
import com.project.daisyDonation.common.security.UserPrincipal;
import com.project.daisyDonation.donation.dto.DonationCreateRequest;
import com.project.daisyDonation.donation.dto.DonationDetailResponse;
import com.project.daisyDonation.donation.service.DonationService;
import com.project.daisyDonation.donation.entity.DonationType;
import com.project.daisyDonation.recurring.dto.RecurringDonationRequest;
import com.project.daisyDonation.recurring.dto.RecurringDonationResponse;
import com.project.daisyDonation.recurring.entity.RecurringDonation;
import com.project.daisyDonation.recurring.service.RecurringDonationService;

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
@RequestMapping("/api/v1/recurring-donations")
@RequiredArgsConstructor
@Tag(name = "Recurring Donations", description = "Manage recurring donation schedules and generated donations")
@SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
public class RecurringDonationController {

    private final RecurringDonationService recurringDonationService;
    private final DonationService donationService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ORG_ADMIN','FUNDRAISING_MANAGER','STAFF')")
    @Operation(
            summary = "Create recurring donation",
            description = "Creates a recurring donation schedule for a donor.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "201",
                    description = "Recurring donation created",
                    content = @Content(schema = @Schema(implementation = RecurringDonationResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "401",
                    description = "Unauthorized"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "403",
                    description = "Forbidden")
    })
    public ResponseEntity<ApiResponse<RecurringDonationResponse>> create(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody RecurringDonationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Recurring donation created",
                        recurringDonationService.create(principal, request)));
    }

    @GetMapping
    @Operation(
            summary = "List recurring donations",
            description = "Returns recurring donation schedules for the authenticated organization context.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Recurring donations returned",
                    content = @Content(schema = @Schema(implementation = RecurringDonationResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "401",
                    description = "Unauthorized")
    })
    public ResponseEntity<ApiResponse<List<RecurringDonationResponse>>> list(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.ok(recurringDonationService.list(principal)));
    }

    @GetMapping("/{id}")
    @Operation(
            summary = "Get recurring donation by ID",
            description = "Returns details for a specific recurring donation schedule.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Recurring donation returned",
                    content = @Content(schema = @Schema(implementation = RecurringDonationResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "401",
                    description = "Unauthorized"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "404",
                    description = "Recurring donation not found")
    })
    public ResponseEntity<ApiResponse<RecurringDonationResponse>> getById(
            @AuthenticationPrincipal UserPrincipal principal,
            @Parameter(description = "Recurring donation ID") @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(recurringDonationService.getById(principal, id)));
    }

    @PostMapping("/{id}/generate-donation")
    @PreAuthorize("hasAnyRole('ORG_ADMIN','FUNDRAISING_MANAGER','FINANCE_MANAGER','STAFF')")
    @Operation(
            summary = "Generate donation from schedule",
            description = "Creates a one-time donation transaction from an active recurring donation schedule.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "201",
                    description = "Donation generated",
                    content = @Content(schema = @Schema(implementation = DonationDetailResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "400",
                    description = "Recurring donation is inactive"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "401",
                    description = "Unauthorized"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "403",
                    description = "Forbidden"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "404",
                    description = "Recurring donation not found")
    })
    public ResponseEntity<ApiResponse<DonationDetailResponse>> generateDonation(
            @AuthenticationPrincipal UserPrincipal principal,
            @Parameter(description = "Recurring donation ID") @PathVariable Long id) {
        RecurringDonation recurring = recurringDonationService.requireRecurring(principal, id);
        if (!recurring.isActive()) {
            throw new BadRequestException("Recurring donation is not active");
        }

        DonationCreateRequest request = DonationCreateRequest.builder()
                .donorId(recurring.getDonor().getId())
                .amount(recurring.getAmount())
                .donationType(DonationType.RECURRING)
                .campaignId(recurring.getCampaign() != null ? recurring.getCampaign().getId() : null)
                .recurringDonationId(recurring.getId())
                .source("RECURRING")
                .build();

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Donation generated from recurring schedule",
                        donationService.create(principal, request)));
    }
}
