package com.project.daisyDonation.fund.controller;

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
import com.project.daisyDonation.fund.dto.FundRequest;
import com.project.daisyDonation.fund.dto.FundResponse;
import com.project.daisyDonation.fund.dto.FundTransferRequest;
import com.project.daisyDonation.fund.dto.FundTransferResponse;
import com.project.daisyDonation.fund.service.FundService;

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
@RequestMapping("/api/v1/funds")
@RequiredArgsConstructor
@Tag(name = "Funds", description = "Fund setup, balances, and inter-fund transfers")
@SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
public class FundController {

    private final FundService fundService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ORG_ADMIN','FINANCE_MANAGER')")
    @Operation(
            summary = "Create fund",
            description = "Creates a new fund with opening details and classification.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "201",
                    description = "Fund created",
                    content = @Content(schema = @Schema(implementation = FundResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "401",
                    description = "Unauthorized"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "403",
                    description = "Forbidden")
    })
    public ResponseEntity<ApiResponse<FundResponse>> create(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody FundRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Fund created", fundService.create(principal, request)));
    }

    @GetMapping
    @Operation(
            summary = "List funds",
            description = "Returns all funds available in the organization.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Fund list",
                    content = @Content(schema = @Schema(implementation = FundResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "401",
                    description = "Unauthorized")
    })
    public ResponseEntity<ApiResponse<List<FundResponse>>> list(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.ok(fundService.list(principal)));
    }

    @PostMapping("/transfers")
    @PreAuthorize("hasAnyRole('ORG_ADMIN','FINANCE_MANAGER')")
    @Operation(
            summary = "Transfer between funds",
            description = "Creates a transfer transaction from one fund to another.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "201",
                    description = "Transfer completed",
                    content = @Content(schema = @Schema(implementation = FundTransferResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "401",
                    description = "Unauthorized"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "403",
                    description = "Forbidden")
    })
    public ResponseEntity<ApiResponse<FundTransferResponse>> transfer(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody FundTransferRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Fund transfer completed", fundService.transfer(principal, request)));
    }

    @GetMapping("/transfers")
    @Operation(
            summary = "List fund transfers",
            description = "Returns historical inter-fund transfer records.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Transfer list",
                    content = @Content(schema = @Schema(implementation = FundTransferResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "401",
                    description = "Unauthorized")
    })
    public ResponseEntity<ApiResponse<List<FundTransferResponse>>> listTransfers(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.ok(fundService.listTransfers(principal)));
    }

    @GetMapping("/{id}")
    @Operation(
            summary = "Get fund by ID",
            description = "Returns details for a single fund by identifier.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Fund details",
                    content = @Content(schema = @Schema(implementation = FundResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "401",
                    description = "Unauthorized")
    })
    public ResponseEntity<ApiResponse<FundResponse>> getById(
            @AuthenticationPrincipal UserPrincipal principal,
            @Parameter(description = "Fund identifier")
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(fundService.getById(principal, id)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ORG_ADMIN','FINANCE_MANAGER')")
    @Operation(
            summary = "Update fund",
            description = "Updates mutable fund information by identifier.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Fund updated",
                    content = @Content(schema = @Schema(implementation = FundResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "401",
                    description = "Unauthorized"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "403",
                    description = "Forbidden")
    })
    public ResponseEntity<ApiResponse<FundResponse>> update(
            @AuthenticationPrincipal UserPrincipal principal,
            @Parameter(description = "Fund identifier")
            @PathVariable Long id,
            @Valid @RequestBody FundRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Fund updated", fundService.update(principal, id, request)));
    }
}
