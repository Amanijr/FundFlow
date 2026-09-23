package com.project.daisyDonation.church.controller;

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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.project.daisyDonation.church.dto.PartnershipRequest;
import com.project.daisyDonation.church.dto.PartnershipResponse;
import com.project.daisyDonation.church.service.PartnershipService;
import com.project.daisyDonation.common.config.OpenApiConfig;
import com.project.daisyDonation.common.dto.ApiResponse;
import com.project.daisyDonation.common.security.UserPrincipal;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/church/partnerships")
@RequiredArgsConstructor
@Tag(name = "Church partnerships", description = "Monthly partnership offerings by member")
@SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
public class PartnershipController {

    private final PartnershipService partnershipService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ORG_ADMIN','FUNDRAISING_MANAGER','FINANCE_MANAGER','STAFF')")
    @Operation(summary = "Create partnership")
    public ResponseEntity<ApiResponse<PartnershipResponse>> create(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody PartnershipRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Partnership created", partnershipService.create(principal, request)));
    }

    @GetMapping
    @Operation(summary = "List partnerships")
    public ResponseEntity<ApiResponse<List<PartnershipResponse>>> list(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) Long memberId) {
        return ResponseEntity.ok(ApiResponse.ok(partnershipService.list(principal, memberId)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get partnership")
    public ResponseEntity<ApiResponse<PartnershipResponse>> getById(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(partnershipService.getById(principal, id)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ORG_ADMIN','FUNDRAISING_MANAGER','FINANCE_MANAGER','STAFF')")
    @Operation(summary = "Update partnership")
    public ResponseEntity<ApiResponse<PartnershipResponse>> update(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody PartnershipRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Partnership updated", partnershipService.update(principal, id, request)));
    }
}
