package com.project.daisyDonation.program.controller;

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
import com.project.daisyDonation.program.dto.ProgramDashboardResponse;
import com.project.daisyDonation.program.dto.ProgramRequest;
import com.project.daisyDonation.program.dto.ProgramResponse;
import com.project.daisyDonation.program.service.ProgramService;

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
@RequestMapping("/api/v1/programs")
@RequiredArgsConstructor
@Tag(name = "Programs", description = "Program lifecycle management and program-level reporting")
@SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
public class ProgramController {

    private final ProgramService programService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ORG_ADMIN','FINANCE_MANAGER','PROGRAM_MANAGER')")
    @Operation(
            summary = "Create program",
            description = "Creates a new organizational program with the provided details.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "201",
                    description = "Program created",
                    content = @Content(schema = @Schema(implementation = ProgramResponse.class))),
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
    public ResponseEntity<ApiResponse<ProgramResponse>> create(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody ProgramRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Program created", programService.create(principal, request)));
    }

    @GetMapping
    @Operation(
            summary = "List programs",
            description = "Returns all programs available to the authenticated organization.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Programs list",
                    content = @Content(schema = @Schema(implementation = ProgramResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "401",
                    description = "Unauthorized")
    })
    public ResponseEntity<ApiResponse<List<ProgramResponse>>> list(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.ok(programService.list(principal)));
    }

    @GetMapping("/{id}")
    @Operation(
            summary = "Get program",
            description = "Fetches a single program by its identifier.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Program details",
                    content = @Content(schema = @Schema(implementation = ProgramResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "401",
                    description = "Unauthorized"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "404",
                    description = "Program not found")
    })
    public ResponseEntity<ApiResponse<ProgramResponse>> getById(
            @AuthenticationPrincipal UserPrincipal principal,
            @Parameter(description = "Program identifier")
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(programService.getById(principal, id)));
    }

    @GetMapping("/{id}/dashboard")
    @Operation(
            summary = "Program dashboard",
            description = "Returns KPI and financial dashboard metrics for a specific program.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Program dashboard",
                    content = @Content(schema = @Schema(implementation = ProgramDashboardResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "401",
                    description = "Unauthorized"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "404",
                    description = "Program not found")
    })
    public ResponseEntity<ApiResponse<ProgramDashboardResponse>> dashboard(
            @AuthenticationPrincipal UserPrincipal principal,
            @Parameter(description = "Program identifier")
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(programService.getDashboard(principal, id)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ORG_ADMIN','FINANCE_MANAGER','PROGRAM_MANAGER')")
    @Operation(
            summary = "Update program",
            description = "Updates an existing program by identifier.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Program updated",
                    content = @Content(schema = @Schema(implementation = ProgramResponse.class))),
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
                    description = "Program not found")
    })
    public ResponseEntity<ApiResponse<ProgramResponse>> update(
            @AuthenticationPrincipal UserPrincipal principal,
            @Parameter(description = "Program identifier")
            @PathVariable Long id,
            @Valid @RequestBody ProgramRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Program updated", programService.update(principal, id, request)));
    }
}
