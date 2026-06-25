package com.project.daisyDonation.budget.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.project.daisyDonation.budget.dto.BudgetLineRequest;
import com.project.daisyDonation.budget.dto.BudgetLineResponse;
import com.project.daisyDonation.budget.dto.BudgetRequest;
import com.project.daisyDonation.budget.dto.BudgetResponse;
import com.project.daisyDonation.budget.dto.BudgetVarianceResponse;
import com.project.daisyDonation.budget.service.BudgetService;
import com.project.daisyDonation.common.config.OpenApiConfig;
import com.project.daisyDonation.common.dto.ApiResponse;
import com.project.daisyDonation.common.security.UserPrincipal;

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
@RequestMapping("/api/v1/budgets")
@RequiredArgsConstructor
@Tag(name = "Budgets", description = "Budget planning, approval workflow, and variance analysis")
@SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
public class BudgetController {

    private final BudgetService budgetService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ORG_ADMIN','FINANCE_MANAGER')")
    @Operation(
            summary = "Create budget",
            description = "Creates a new budget draft.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "201",
                    description = "Budget created",
                    content = @Content(schema = @Schema(implementation = BudgetResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden")
    })
    public ResponseEntity<ApiResponse<BudgetResponse>> create(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody BudgetRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Budget created", budgetService.create(principal, request)));
    }

    @GetMapping
    @Operation(
            summary = "List budgets",
            description = "Returns all budgets visible to the current organization.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Budget list",
                    content = @Content(schema = @Schema(implementation = BudgetResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<ApiResponse<List<BudgetResponse>>> list(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.ok(budgetService.list(principal)));
    }

    @GetMapping("/{id}")
    @Operation(
            summary = "Get budget by ID",
            description = "Returns details for a specific budget.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Budget details",
                    content = @Content(schema = @Schema(implementation = BudgetResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<ApiResponse<BudgetResponse>> getById(
            @AuthenticationPrincipal UserPrincipal principal,
            @Parameter(description = "Budget identifier")
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(budgetService.getById(principal, id)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ORG_ADMIN','FINANCE_MANAGER')")
    @Operation(
            summary = "Update budget",
            description = "Updates a budget draft by identifier.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Budget updated",
                    content = @Content(schema = @Schema(implementation = BudgetResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden")
    })
    public ResponseEntity<ApiResponse<BudgetResponse>> update(
            @AuthenticationPrincipal UserPrincipal principal,
            @Parameter(description = "Budget identifier")
            @PathVariable Long id,
            @Valid @RequestBody BudgetRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Budget updated", budgetService.update(principal, id, request)));
    }

    @PostMapping("/{id}/lines")
    @PreAuthorize("hasAnyRole('ORG_ADMIN','FINANCE_MANAGER')")
    @Operation(
            summary = "Add budget line",
            description = "Adds a budget allocation line to a budget.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "201",
                    description = "Budget line added",
                    content = @Content(schema = @Schema(implementation = BudgetLineResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden")
    })
    public ResponseEntity<ApiResponse<BudgetLineResponse>> addLine(
            @AuthenticationPrincipal UserPrincipal principal,
            @Parameter(description = "Budget identifier")
            @PathVariable Long id,
            @Valid @RequestBody BudgetLineRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Budget line added", budgetService.addLine(principal, id, request)));
    }

    @PutMapping("/{id}/lines/{lineId}")
    @PreAuthorize("hasAnyRole('ORG_ADMIN','FINANCE_MANAGER')")
    @Operation(
            summary = "Update budget line",
            description = "Updates an existing budget line item.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Budget line updated",
                    content = @Content(schema = @Schema(implementation = BudgetLineResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden")
    })
    public ResponseEntity<ApiResponse<BudgetLineResponse>> updateLine(
            @AuthenticationPrincipal UserPrincipal principal,
            @Parameter(description = "Budget identifier")
            @PathVariable Long id,
            @Parameter(description = "Budget line identifier")
            @PathVariable Long lineId,
            @Valid @RequestBody BudgetLineRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(
                "Budget line updated", budgetService.updateLine(principal, id, lineId, request)));
    }

    @DeleteMapping("/{id}/lines/{lineId}")
    @PreAuthorize("hasAnyRole('ORG_ADMIN','FINANCE_MANAGER')")
    @Operation(
            summary = "Delete budget line",
            description = "Removes a budget line from a budget.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Budget line deleted"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden")
    })
    public ResponseEntity<ApiResponse<Void>> deleteLine(
            @AuthenticationPrincipal UserPrincipal principal,
            @Parameter(description = "Budget identifier")
            @PathVariable Long id,
            @Parameter(description = "Budget line identifier")
            @PathVariable Long lineId) {
        budgetService.deleteLine(principal, id, lineId);
        return ResponseEntity.ok(ApiResponse.ok("Budget line deleted", null));
    }

    @PostMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('ORG_ADMIN','FINANCE_MANAGER')")
    @Operation(
            summary = "Approve budget",
            description = "Approves a budget for activation.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Budget approved",
                    content = @Content(schema = @Schema(implementation = BudgetResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden")
    })
    public ResponseEntity<ApiResponse<BudgetResponse>> approve(
            @AuthenticationPrincipal UserPrincipal principal,
            @Parameter(description = "Budget identifier")
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("Budget approved", budgetService.approve(principal, id)));
    }

    @PostMapping("/{id}/activate")
    @PreAuthorize("hasAnyRole('ORG_ADMIN','FINANCE_MANAGER')")
    @Operation(
            summary = "Activate budget",
            description = "Activates an approved budget.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Budget activated",
                    content = @Content(schema = @Schema(implementation = BudgetResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden")
    })
    public ResponseEntity<ApiResponse<BudgetResponse>> activate(
            @AuthenticationPrincipal UserPrincipal principal,
            @Parameter(description = "Budget identifier")
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("Budget activated", budgetService.activate(principal, id)));
    }

    @PostMapping("/{id}/close")
    @PreAuthorize("hasAnyRole('ORG_ADMIN','FINANCE_MANAGER')")
    @Operation(
            summary = "Close budget",
            description = "Closes an active budget period.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Budget closed",
                    content = @Content(schema = @Schema(implementation = BudgetResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden")
    })
    public ResponseEntity<ApiResponse<BudgetResponse>> close(
            @AuthenticationPrincipal UserPrincipal principal,
            @Parameter(description = "Budget identifier")
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("Budget closed", budgetService.close(principal, id)));
    }

    @GetMapping("/{id}/variance")
    @Operation(
            summary = "Budget variance report",
            description = "Returns budget-versus-actual variance for a budget within an optional date range.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Budget variance",
                    content = @Content(schema = @Schema(implementation = BudgetVarianceResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<ApiResponse<BudgetVarianceResponse>> variance(
            @AuthenticationPrincipal UserPrincipal principal,
            @Parameter(description = "Budget identifier")
            @PathVariable Long id,
            @Parameter(description = "Period start date (ISO-8601). Optional.")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @Parameter(description = "Period end date (ISO-8601). Optional.")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(ApiResponse.ok(budgetService.getVariance(principal, id, from, to)));
    }
}
