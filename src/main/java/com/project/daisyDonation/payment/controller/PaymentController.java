package com.project.daisyDonation.payment.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.project.daisyDonation.common.config.OpenApiConfig;
import com.project.daisyDonation.common.dto.ApiResponse;
import com.project.daisyDonation.common.security.UserPrincipal;
import com.project.daisyDonation.payment.dto.ManualPaymentRequest;
import com.project.daisyDonation.payment.dto.PaymentRequest;
import com.project.daisyDonation.payment.dto.PaymentResponse;
import com.project.daisyDonation.payment.service.PaymentProcessingService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/donations/{donationId}/payments")
@RequiredArgsConstructor
@Tag(
        name = "Payments",
        description = "Donation payment processing endpoints")
@SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
public class PaymentController {

    private final PaymentProcessingService paymentProcessingService;

    @PostMapping("/gateway")
    @PreAuthorize("hasAnyRole('ORG_ADMIN','FUNDRAISING_MANAGER','FINANCE_MANAGER','STAFF')")
    @Operation(
            summary = "Process gateway payment",
            description = "Processes an online gateway payment for the specified donation.")
    public ResponseEntity<ApiResponse<PaymentResponse>> processGatewayPayment(
            @AuthenticationPrincipal UserPrincipal principal,
            @Parameter(description = "Unique donation identifier")
            @PathVariable Long donationId,
            @Valid @RequestBody PaymentRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(
                "Gateway payment processed",
                paymentProcessingService.processGatewayPayment(principal, donationId, request)));
    }

    @PostMapping("/manual")
    @PreAuthorize("hasAnyRole('ORG_ADMIN','FINANCE_MANAGER')")
    @Operation(
            summary = "Record manual payment",
            description = "Records an offline or manually confirmed payment for the specified donation.")
    public ResponseEntity<ApiResponse<PaymentResponse>> recordManualPayment(
            @AuthenticationPrincipal UserPrincipal principal,
            @Parameter(description = "Unique donation identifier")
            @PathVariable Long donationId,
            @Valid @RequestBody ManualPaymentRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(
                "Manual payment recorded",
                paymentProcessingService.recordManualPayment(principal, donationId, request)));
    }
}
