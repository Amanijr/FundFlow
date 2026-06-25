package com.project.daisyDonation.school.controller;

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
import com.project.daisyDonation.school.dto.StudentSponsorshipRequest;
import com.project.daisyDonation.school.dto.StudentSponsorshipResponse;
import com.project.daisyDonation.school.service.StudentSponsorshipService;

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
@RequestMapping("/api/v1/school/sponsorships")
@RequiredArgsConstructor
@Tag(name = "School Sponsorships", description = "Student sponsorship registration and maintenance")
@SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
public class StudentSponsorshipController {

    private final StudentSponsorshipService studentSponsorshipService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ORG_ADMIN','FINANCE_MANAGER','PROGRAM_MANAGER','STAFF')")
    @Operation(
            summary = "Create sponsorship",
            description = "Creates a new student sponsorship record.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "201",
                    description = "Sponsorship created",
                    content = @Content(schema = @Schema(implementation = StudentSponsorshipResponse.class))),
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
    public ResponseEntity<ApiResponse<StudentSponsorshipResponse>> create(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody StudentSponsorshipRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Sponsorship created", studentSponsorshipService.create(principal, request)));
    }

    @GetMapping
    @Operation(
            summary = "List sponsorships",
            description = "Returns all student sponsorships for the authenticated organization.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Sponsorship list",
                    content = @Content(schema = @Schema(implementation = StudentSponsorshipResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "401",
                    description = "Unauthorized")
    })
    public ResponseEntity<ApiResponse<List<StudentSponsorshipResponse>>> list(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.ok(studentSponsorshipService.list(principal)));
    }

    @GetMapping("/{id}")
    @Operation(
            summary = "Get sponsorship",
            description = "Fetches a student sponsorship by identifier.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Sponsorship details",
                    content = @Content(schema = @Schema(implementation = StudentSponsorshipResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "401",
                    description = "Unauthorized"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "404",
                    description = "Sponsorship not found")
    })
    public ResponseEntity<ApiResponse<StudentSponsorshipResponse>> getById(
            @AuthenticationPrincipal UserPrincipal principal,
            @Parameter(description = "Sponsorship identifier")
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(studentSponsorshipService.getById(principal, id)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ORG_ADMIN','FINANCE_MANAGER','PROGRAM_MANAGER','STAFF')")
    @Operation(
            summary = "Update sponsorship",
            description = "Updates an existing student sponsorship.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Sponsorship updated",
                    content = @Content(schema = @Schema(implementation = StudentSponsorshipResponse.class))),
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
                    description = "Sponsorship not found")
    })
    public ResponseEntity<ApiResponse<StudentSponsorshipResponse>> update(
            @AuthenticationPrincipal UserPrincipal principal,
            @Parameter(description = "Sponsorship identifier")
            @PathVariable Long id,
            @Valid @RequestBody StudentSponsorshipRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(
                "Sponsorship updated", studentSponsorshipService.update(principal, id, request)));
    }
}
