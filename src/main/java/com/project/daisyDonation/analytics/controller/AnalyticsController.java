package com.project.daisyDonation.analytics.controller;

import java.time.LocalDate;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.project.daisyDonation.analytics.dto.ExecutiveDashboardResponse;
import com.project.daisyDonation.analytics.dto.ForecastResponse;
import com.project.daisyDonation.analytics.dto.InsightsResponse;
import com.project.daisyDonation.analytics.dto.TrendAnalysisResponse;
import com.project.daisyDonation.analytics.service.AnalyticsService;
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
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/analytics")
@RequiredArgsConstructor
@Tag(
        name = "Analytics",
        description = "Executive intelligence: KPI dashboards, trend analysis, forecasting, and rule-based insights")
@SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/dashboard")
    @Operation(
            summary = "Executive dashboard",
            description = """
                    Returns organization-wide KPIs for the selected period: donations, expenses, net position,
                    cash balance, fund balances, growth rates, donor metrics, active campaigns, budget utilization,
                    and pending expense approvals. Defaults to year-to-date when dates are omitted.
                    """)
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Dashboard KPIs",
                    content = @Content(schema = @Schema(implementation = ExecutiveDashboardResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "401",
                    description = "Unauthorized")
    })
    public ResponseEntity<ApiResponse<ExecutiveDashboardResponse>> dashboard(
            @AuthenticationPrincipal UserPrincipal principal,
            @Parameter(description = "Period start date (ISO-8601). Defaults to Jan 1 of the current year.")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @Parameter(description = "Period end date (ISO-8601). Defaults to today.")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(ApiResponse.ok(
                analyticsService.getExecutiveDashboard(principal, from, to)));
    }

    @GetMapping("/trends")
    @Operation(
            summary = "Trend analysis",
            description = """
                    Returns monthly donation and expense time series, donation source breakdown,
                    and campaign performance for the selected period.
                    """)
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Trend analysis",
                    content = @Content(schema = @Schema(implementation = TrendAnalysisResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "401",
                    description = "Unauthorized")
    })
    public ResponseEntity<ApiResponse<TrendAnalysisResponse>> trends(
            @AuthenticationPrincipal UserPrincipal principal,
            @Parameter(description = "Period start date (ISO-8601). Defaults to Jan 1 of the current year.")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @Parameter(description = "Period end date (ISO-8601). Defaults to today.")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(ApiResponse.ok(
                analyticsService.getTrendAnalysis(principal, from, to)));
    }

    @GetMapping("/forecast")
    @Operation(
            summary = "Financial forecast",
            description = """
                    Projects donations, expenses, and net position for upcoming months using a linear trend
                    derived from the last 6 months of activity.
                    """)
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Forecast projections",
                    content = @Content(schema = @Schema(implementation = ForecastResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "401",
                    description = "Unauthorized")
    })
    public ResponseEntity<ApiResponse<ForecastResponse>> forecast(
            @AuthenticationPrincipal UserPrincipal principal,
            @Parameter(description = "Number of future months to project (1–12). Defaults to 3.")
            @RequestParam(required = false) Integer months) {
        return ResponseEntity.ok(ApiResponse.ok(
                analyticsService.getForecast(principal, months)));
    }

    @GetMapping("/insights")
    @Operation(
            summary = "Executive insights",
            description = """
                    Returns rule-based alerts for fundraising, budget, liquidity, campaigns, and operations.
                    No external AI service is required.
                    """)
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Insight items",
                    content = @Content(schema = @Schema(implementation = InsightsResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "401",
                    description = "Unauthorized")
    })
    public ResponseEntity<ApiResponse<InsightsResponse>> insights(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.ok(
                analyticsService.getInsights(principal)));
    }
}
