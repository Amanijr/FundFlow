package com.project.daisyDonation.communication.controller;

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
import com.project.daisyDonation.communication.dto.CommunicationLogResponse;
import com.project.daisyDonation.communication.dto.ReceiptResponse;
import com.project.daisyDonation.communication.dto.SendMessageRequest;
import com.project.daisyDonation.communication.dto.SendReceiptRequest;
import com.project.daisyDonation.communication.service.CommunicationService;

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
@RequestMapping("/api/v1/communications")
@RequiredArgsConstructor
@Tag(name = "Communications", description = "Send donor messages, receipts, and view communication history")
@SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
public class CommunicationController {

    private final CommunicationService communicationService;

    @PostMapping("/send")
    @PreAuthorize("hasAnyRole('ORG_ADMIN','FINANCE_MANAGER','FUNDRAISING_MANAGER')")
    @Operation(
            summary = "Send communication message",
            description = "Sends a communication message using the provided channel/template details.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "201",
                    description = "Message sent",
                    content = @Content(schema = @Schema(implementation = CommunicationLogResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "401",
                    description = "Unauthorized"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "403",
                    description = "Forbidden")
    })
    public ResponseEntity<ApiResponse<CommunicationLogResponse>> send(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody SendMessageRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Message sent", communicationService.sendMessage(principal, request)));
    }

    @GetMapping
    @Operation(
            summary = "List communications",
            description = "Returns communication log records accessible to the authenticated organization context.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Communications returned",
                    content = @Content(schema = @Schema(implementation = CommunicationLogResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "401",
                    description = "Unauthorized")
    })
    public ResponseEntity<ApiResponse<List<CommunicationLogResponse>>> list(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.ok(communicationService.list(principal)));
    }

    @GetMapping("/donations/{donationId}")
    @Operation(
            summary = "List communications for donation",
            description = "Returns communication logs associated with a specific donation.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Donation communications returned",
                    content = @Content(schema = @Schema(implementation = CommunicationLogResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "401",
                    description = "Unauthorized"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "404",
                    description = "Donation not found")
    })
    public ResponseEntity<ApiResponse<List<CommunicationLogResponse>>> listForDonation(
            @AuthenticationPrincipal UserPrincipal principal,
            @Parameter(description = "Donation ID") @PathVariable Long donationId) {
        return ResponseEntity.ok(ApiResponse.ok(communicationService.listForDonation(principal, donationId)));
    }

    @GetMapping("/receipts/{donationId}")
    @Operation(
            summary = "Preview donation receipt",
            description = "Builds and returns a receipt preview for a donation.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Receipt preview returned",
                    content = @Content(schema = @Schema(implementation = ReceiptResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "401",
                    description = "Unauthorized"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "404",
                    description = "Donation not found")
    })
    public ResponseEntity<ApiResponse<ReceiptResponse>> previewReceipt(
            @AuthenticationPrincipal UserPrincipal principal,
            @Parameter(description = "Donation ID") @PathVariable Long donationId) {
        return ResponseEntity.ok(ApiResponse.ok(communicationService.previewReceipt(principal, donationId)));
    }

    @PostMapping("/receipts/{donationId}")
    @PreAuthorize("hasAnyRole('ORG_ADMIN','FINANCE_MANAGER','FUNDRAISING_MANAGER')")
    @Operation(
            summary = "Send donation receipt",
            description = "Sends a receipt for a donation and records the communication log.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "201",
                    description = "Receipt sent",
                    content = @Content(schema = @Schema(implementation = CommunicationLogResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "401",
                    description = "Unauthorized"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "403",
                    description = "Forbidden"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "404",
                    description = "Donation not found")
    })
    public ResponseEntity<ApiResponse<CommunicationLogResponse>> sendReceipt(
            @AuthenticationPrincipal UserPrincipal principal,
            @Parameter(description = "Donation ID") @PathVariable Long donationId,
            @Valid @RequestBody(required = false) SendReceiptRequest request) {
        SendReceiptRequest payload = request != null ? request : new SendReceiptRequest();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(
                        "Receipt sent",
                        communicationService.sendReceipt(principal, donationId, payload)));
    }
}
