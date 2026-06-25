package com.project.daisyDonation.expense.controller;

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
import com.project.daisyDonation.expense.dto.ExpensePaymentRequest;
import com.project.daisyDonation.expense.dto.ExpenseRejectionRequest;
import com.project.daisyDonation.expense.dto.ExpenseReportResponse;
import com.project.daisyDonation.expense.dto.ExpenseRequest;
import com.project.daisyDonation.expense.dto.ExpenseResponse;
import com.project.daisyDonation.expense.service.ExpenseService;

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
@RequestMapping("/api/v1/expenses")
@RequiredArgsConstructor
@Tag(name = "Expenses", description = "Expense lifecycle from request to payment and reconciliation")
@SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
public class ExpenseController {

    private final ExpenseService expenseService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ORG_ADMIN','FINANCE_MANAGER','STAFF')")
    @Operation(
            summary = "Create expense",
            description = "Creates a new expense request.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "201",
                    description = "Expense created",
                    content = @Content(schema = @Schema(implementation = ExpenseResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden")
    })
    public ResponseEntity<ApiResponse<ExpenseResponse>> create(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody ExpenseRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Expense created", expenseService.create(principal, request)));
    }

    @GetMapping
    @Operation(
            summary = "List expenses",
            description = "Returns expenses accessible to the current user.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Expense list",
                    content = @Content(schema = @Schema(implementation = ExpenseResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<ApiResponse<List<ExpenseResponse>>> list(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.ok(expenseService.list(principal)));
    }

    @GetMapping("/report")
    @Operation(
            summary = "Expense report",
            description = "Returns expense totals and status breakdowns.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Expense report",
                    content = @Content(schema = @Schema(implementation = ExpenseReportResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<ApiResponse<ExpenseReportResponse>> report(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.ok(expenseService.getReport(principal)));
    }

    @GetMapping("/{id}")
    @Operation(
            summary = "Get expense by ID",
            description = "Returns details for a specific expense.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Expense details",
                    content = @Content(schema = @Schema(implementation = ExpenseResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<ApiResponse<ExpenseResponse>> getById(
            @AuthenticationPrincipal UserPrincipal principal,
            @Parameter(description = "Expense identifier")
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(expenseService.getById(principal, id)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ORG_ADMIN','FINANCE_MANAGER','STAFF')")
    @Operation(
            summary = "Update expense",
            description = "Updates an existing draft expense.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Expense updated",
                    content = @Content(schema = @Schema(implementation = ExpenseResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden")
    })
    public ResponseEntity<ApiResponse<ExpenseResponse>> update(
            @AuthenticationPrincipal UserPrincipal principal,
            @Parameter(description = "Expense identifier")
            @PathVariable Long id,
            @Valid @RequestBody ExpenseRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Expense updated", expenseService.update(principal, id, request)));
    }

    @PostMapping("/{id}/submit")
    @PreAuthorize("hasAnyRole('ORG_ADMIN','FINANCE_MANAGER','STAFF')")
    @Operation(
            summary = "Submit expense",
            description = "Submits an expense for approval workflow.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Expense submitted",
                    content = @Content(schema = @Schema(implementation = ExpenseResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden")
    })
    public ResponseEntity<ApiResponse<ExpenseResponse>> submit(
            @AuthenticationPrincipal UserPrincipal principal,
            @Parameter(description = "Expense identifier")
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("Expense submitted", expenseService.submit(principal, id)));
    }

    @PostMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('ORG_ADMIN','FINANCE_MANAGER')")
    @Operation(
            summary = "Approve expense",
            description = "Approves a submitted expense.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Expense approved",
                    content = @Content(schema = @Schema(implementation = ExpenseResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden")
    })
    public ResponseEntity<ApiResponse<ExpenseResponse>> approve(
            @AuthenticationPrincipal UserPrincipal principal,
            @Parameter(description = "Expense identifier")
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("Expense approved", expenseService.approve(principal, id)));
    }

    @PostMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('ORG_ADMIN','FINANCE_MANAGER')")
    @Operation(
            summary = "Reject expense",
            description = "Rejects an expense with a reason.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Expense rejected",
                    content = @Content(schema = @Schema(implementation = ExpenseResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden")
    })
    public ResponseEntity<ApiResponse<ExpenseResponse>> reject(
            @AuthenticationPrincipal UserPrincipal principal,
            @Parameter(description = "Expense identifier")
            @PathVariable Long id,
            @Valid @RequestBody ExpenseRejectionRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Expense rejected", expenseService.reject(principal, id, request)));
    }

    @PostMapping("/{id}/pay")
    @PreAuthorize("hasAnyRole('ORG_ADMIN','FINANCE_MANAGER')")
    @Operation(
            summary = "Pay expense",
            description = "Records payment details for an approved expense.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Expense paid",
                    content = @Content(schema = @Schema(implementation = ExpenseResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden")
    })
    public ResponseEntity<ApiResponse<ExpenseResponse>> pay(
            @AuthenticationPrincipal UserPrincipal principal,
            @Parameter(description = "Expense identifier")
            @PathVariable Long id,
            @Valid @RequestBody ExpensePaymentRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Expense paid", expenseService.pay(principal, id, request)));
    }

    @PostMapping("/{id}/reconcile")
    @PreAuthorize("hasAnyRole('ORG_ADMIN','FINANCE_MANAGER')")
    @Operation(
            summary = "Reconcile expense",
            description = "Marks an expense as reconciled after settlement checks.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Expense reconciled",
                    content = @Content(schema = @Schema(implementation = ExpenseResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden")
    })
    public ResponseEntity<ApiResponse<ExpenseResponse>> reconcile(
            @AuthenticationPrincipal UserPrincipal principal,
            @Parameter(description = "Expense identifier")
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("Expense reconciled", expenseService.reconcile(principal, id)));
    }
}
