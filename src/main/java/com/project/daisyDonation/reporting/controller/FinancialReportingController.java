package com.project.daisyDonation.reporting.controller;

import java.time.LocalDate;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.project.daisyDonation.common.config.OpenApiConfig;
import com.project.daisyDonation.common.dto.ApiResponse;
import com.project.daisyDonation.common.security.UserPrincipal;
import com.project.daisyDonation.reporting.dto.BalanceSheetResponse;
import com.project.daisyDonation.reporting.dto.BudgetReportResponse;
import com.project.daisyDonation.reporting.dto.CashFlowResponse;
import com.project.daisyDonation.reporting.dto.FundReportResponse;
import com.project.daisyDonation.reporting.dto.IncomeExpenditureResponse;
import com.project.daisyDonation.reporting.service.FinancialReportingService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/reports")
@RequiredArgsConstructor
@Tag(name = "Financial Reports", description = "Core financial statements and fund/budget reporting")
@SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
public class FinancialReportingController {

    private final FinancialReportingService financialReportingService;

    @GetMapping("/income-expenditure")
    @Operation(
            summary = "Income and expenditure report",
            description = "Returns income, expenses, and net result for an optional date range.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Income and expenditure report",
                    content = @Content(schema = @Schema(implementation = IncomeExpenditureResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<ApiResponse<IncomeExpenditureResponse>> incomeExpenditure(
            @AuthenticationPrincipal UserPrincipal principal,
            @Parameter(description = "Period start date (ISO-8601). Optional.")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @Parameter(description = "Period end date (ISO-8601). Optional.")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(ApiResponse.ok(
                financialReportingService.getIncomeExpenditure(principal, from, to)));
    }

    @GetMapping("/balance-sheet")
    @Operation(
            summary = "Balance sheet",
            description = "Returns assets, liabilities, and net assets as of a date.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Balance sheet",
                    content = @Content(schema = @Schema(implementation = BalanceSheetResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<ApiResponse<BalanceSheetResponse>> balanceSheet(
            @AuthenticationPrincipal UserPrincipal principal,
            @Parameter(description = "Snapshot date (ISO-8601). Defaults to today when omitted.")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate asOf) {
        return ResponseEntity.ok(ApiResponse.ok(
                financialReportingService.getBalanceSheet(principal, asOf)));
    }

    @GetMapping("/cash-flow")
    @Operation(
            summary = "Cash flow report",
            description = "Returns operating, investing, and financing cash movements for an optional date range.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Cash flow report",
                    content = @Content(schema = @Schema(implementation = CashFlowResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<ApiResponse<CashFlowResponse>> cashFlow(
            @AuthenticationPrincipal UserPrincipal principal,
            @Parameter(description = "Period start date (ISO-8601). Optional.")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @Parameter(description = "Period end date (ISO-8601). Optional.")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(ApiResponse.ok(
                financialReportingService.getCashFlow(principal, from, to)));
    }

    @GetMapping("/funds")
    @Operation(
            summary = "Fund report",
            description = "Returns fund balances and movements, optionally filtered by fund.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Fund report",
                    content = @Content(schema = @Schema(implementation = FundReportResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<ApiResponse<FundReportResponse>> fundReport(
            @AuthenticationPrincipal UserPrincipal principal,
            @Parameter(description = "Period start date (ISO-8601). Optional.")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @Parameter(description = "Period end date (ISO-8601). Optional.")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @Parameter(description = "Fund identifier to filter report. Optional.")
            @RequestParam(required = false) Long fundId) {
        return ResponseEntity.ok(ApiResponse.ok(
                financialReportingService.getFundReport(principal, from, to, fundId)));
    }

    @GetMapping("/budget")
    @Operation(
            summary = "Budget performance report",
            description = "Returns budgeted versus actual performance for an optional period.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Budget report",
                    content = @Content(schema = @Schema(implementation = BudgetReportResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<ApiResponse<BudgetReportResponse>> budgetReport(
            @AuthenticationPrincipal UserPrincipal principal,
            @Parameter(description = "Period start date (ISO-8601). Optional.")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @Parameter(description = "Period end date (ISO-8601). Optional.")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(ApiResponse.ok(
                financialReportingService.getBudgetReport(principal, from, to)));
    }
}
