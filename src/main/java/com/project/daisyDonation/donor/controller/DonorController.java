package com.project.daisyDonation.donor.controller;

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

import com.project.daisyDonation.common.config.OpenApiConfig;
import com.project.daisyDonation.common.dto.ApiResponse;
import com.project.daisyDonation.common.security.UserPrincipal;
import com.project.daisyDonation.donor.dto.DonorDetailResponse;
import com.project.daisyDonation.donor.dto.DonorRequest;
import com.project.daisyDonation.donor.dto.DonorResponse;
import com.project.daisyDonation.donor.service.DonorService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/donors")
@RequiredArgsConstructor
@Tag(
        name = "Donors",
        description = "Donor lifecycle management and donor detail endpoints")
@SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
public class DonorController {

    private final DonorService donorService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ORG_ADMIN','FUNDRAISING_MANAGER','FINANCE_MANAGER','STAFF')")
    @Operation(
            summary = "Create donor",
            description = "Creates a new donor record for the authenticated organization.")
    public ResponseEntity<ApiResponse<DonorResponse>> create(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody DonorRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Donor created", donorService.create(principal, request)));
    }

    @GetMapping
    @Operation(
            summary = "List donors",
            description = "Returns all donors belonging to the authenticated organization.")
    public ResponseEntity<ApiResponse<List<DonorResponse>>> list(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.ok(donorService.list(principal)));
    }

    @GetMapping("/{id}")
    @Operation(
            summary = "Get donor by id",
            description = "Returns donor details for the provided donor identifier.")
    public ResponseEntity<ApiResponse<DonorDetailResponse>> getById(
            @AuthenticationPrincipal UserPrincipal principal,
            @Parameter(description = "Unique donor identifier")
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(donorService.getById(principal, id)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ORG_ADMIN','FUNDRAISING_MANAGER','FINANCE_MANAGER','STAFF')")
    @Operation(
            summary = "Update donor",
            description = "Updates donor information for the provided donor identifier.")
    public ResponseEntity<ApiResponse<DonorResponse>> update(
            @AuthenticationPrincipal UserPrincipal principal,
            @Parameter(description = "Unique donor identifier")
            @PathVariable Long id,
            @Valid @RequestBody DonorRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Donor updated", donorService.update(principal, id, request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ORG_ADMIN','FUNDRAISING_MANAGER')")
    @Operation(
            summary = "Delete donor",
            description = "Deletes the donor record identified by the provided donor identifier.")
    public ResponseEntity<ApiResponse<Void>> delete(
            @AuthenticationPrincipal UserPrincipal principal,
            @Parameter(description = "Unique donor identifier")
            @PathVariable Long id) {
        donorService.delete(principal, id);
        return ResponseEntity.ok(ApiResponse.ok("Donor deleted", null));
    }
}
