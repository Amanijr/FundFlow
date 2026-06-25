package com.project.daisyDonation.accounting.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.project.daisyDonation.accounting.dto.ChartOfAccountRequest;
import com.project.daisyDonation.accounting.dto.ChartOfAccountResponse;
import com.project.daisyDonation.accounting.dto.GeneralLedgerResponse;
import com.project.daisyDonation.accounting.dto.JournalEntryResponse;
import com.project.daisyDonation.accounting.dto.TrialBalanceResponse;
import com.project.daisyDonation.accounting.service.AccountingService;
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
@RequestMapping("/api/v1/accounting")
@RequiredArgsConstructor
@Tag(name = "Accounting", description = "Chart of accounts, journals, trial balance, and ledger inquiries")
@SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
public class AccountingController {

    private final AccountingService accountingService;

    @PostMapping("/initialize")
    @PreAuthorize("hasAnyRole('ORG_ADMIN','FINANCE_MANAGER')")
    @Operation(
            summary = "Initialize accounting",
            description = "Bootstraps accounting setup including default chart of accounts.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Accounting initialized"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden")
    })
    public ResponseEntity<ApiResponse<Void>> initialize(@AuthenticationPrincipal UserPrincipal principal) {
        accountingService.initialize(principal);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Accounting initialized", null));
    }

    @GetMapping("/chart-of-accounts")
    @Operation(
            summary = "List chart of accounts",
            description = "Returns all accounts configured for the organization.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Accounts list",
                    content = @Content(schema = @Schema(implementation = ChartOfAccountResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<ApiResponse<List<ChartOfAccountResponse>>> listAccounts(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.ok(accountingService.listAccounts(principal)));
    }

    @PostMapping("/chart-of-accounts")
    @PreAuthorize("hasAnyRole('ORG_ADMIN','FINANCE_MANAGER','ACCOUNTANT')")
    @Operation(
            summary = "Create chart account",
            description = "Creates a chart of account entry.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "201",
                    description = "Account created",
                    content = @Content(schema = @Schema(implementation = ChartOfAccountResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden")
    })
    public ResponseEntity<ApiResponse<ChartOfAccountResponse>> createAccount(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody ChartOfAccountRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Account created", accountingService.createAccount(principal, request)));
    }

    @GetMapping("/journal-entries")
    @Operation(
            summary = "List journal entries",
            description = "Returns posted and draft journal entries.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Journal entries",
                    content = @Content(schema = @Schema(implementation = JournalEntryResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<ApiResponse<List<JournalEntryResponse>>> listJournalEntries(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.ok(accountingService.listJournalEntries(principal)));
    }

    @GetMapping("/journal-entries/{id}")
    @Operation(
            summary = "Get journal entry",
            description = "Returns one journal entry with line details.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Journal entry details",
                    content = @Content(schema = @Schema(implementation = JournalEntryResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<ApiResponse<JournalEntryResponse>> getJournalEntry(
            @AuthenticationPrincipal UserPrincipal principal,
            @Parameter(description = "Journal entry identifier")
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(accountingService.getJournalEntry(principal, id)));
    }

    @GetMapping("/trial-balance")
    @Operation(
            summary = "Trial balance",
            description = "Returns debit and credit balances across all accounts.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Trial balance",
                    content = @Content(schema = @Schema(implementation = TrialBalanceResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<ApiResponse<TrialBalanceResponse>> trialBalance(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.ok(accountingService.getTrialBalance(principal)));
    }

    @GetMapping("/general-ledger/{accountId}")
    @Operation(
            summary = "General ledger",
            description = "Returns ledger movements for an account within an optional date range.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "General ledger",
                    content = @Content(schema = @Schema(implementation = GeneralLedgerResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<ApiResponse<GeneralLedgerResponse>> generalLedger(
            @AuthenticationPrincipal UserPrincipal principal,
            @Parameter(description = "Chart of account identifier")
            @PathVariable Long accountId,
            @Parameter(description = "Period start date (ISO-8601). Optional.")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @Parameter(description = "Period end date (ISO-8601). Optional.")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(ApiResponse.ok(
                accountingService.getGeneralLedger(principal, accountId, from, to)));
    }
}
