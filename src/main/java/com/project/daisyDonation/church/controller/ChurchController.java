package com.project.daisyDonation.church.controller;

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
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.project.daisyDonation.church.dto.AttendanceRecordRequest;
import com.project.daisyDonation.church.dto.AttendanceRecordResponse;
import com.project.daisyDonation.church.dto.AttendanceSummaryResponse;
import com.project.daisyDonation.church.dto.MinistryRequest;
import com.project.daisyDonation.church.dto.MinistryResponse;
import com.project.daisyDonation.church.service.AttendanceService;
import com.project.daisyDonation.church.service.MinistryService;
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
@RequestMapping("/api/v1/church")
@RequiredArgsConstructor
@Tag(name = "Church", description = "Church ministry and attendance management")
@SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
public class ChurchController {

    private final MinistryService ministryService;
    private final AttendanceService attendanceService;

    @PostMapping("/ministries")
    @PreAuthorize("hasAnyRole('ORG_ADMIN','FINANCE_MANAGER','STAFF')")
    @Operation(
            summary = "Create ministry",
            description = "Creates a new church ministry.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "201",
                    description = "Ministry created",
                    content = @Content(schema = @Schema(implementation = MinistryResponse.class))),
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
    public ResponseEntity<ApiResponse<MinistryResponse>> createMinistry(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody MinistryRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Ministry created", ministryService.create(principal, request)));
    }

    @GetMapping("/ministries")
    @Operation(
            summary = "List ministries",
            description = "Returns ministries available to the authenticated organization.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Ministries list",
                    content = @Content(schema = @Schema(implementation = MinistryResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "401",
                    description = "Unauthorized")
    })
    public ResponseEntity<ApiResponse<List<MinistryResponse>>> listMinistries(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.ok(ministryService.list(principal)));
    }

    @GetMapping("/ministries/{id}")
    @Operation(
            summary = "Get ministry",
            description = "Fetches a ministry by identifier.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Ministry details",
                    content = @Content(schema = @Schema(implementation = MinistryResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "401",
                    description = "Unauthorized"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "404",
                    description = "Ministry not found")
    })
    public ResponseEntity<ApiResponse<MinistryResponse>> getMinistry(
            @AuthenticationPrincipal UserPrincipal principal,
            @Parameter(description = "Ministry identifier")
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(ministryService.getById(principal, id)));
    }

    @PutMapping("/ministries/{id}")
    @PreAuthorize("hasAnyRole('ORG_ADMIN','FINANCE_MANAGER','STAFF')")
    @Operation(
            summary = "Update ministry",
            description = "Updates an existing ministry record.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Ministry updated",
                    content = @Content(schema = @Schema(implementation = MinistryResponse.class))),
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
                    description = "Ministry not found")
    })
    public ResponseEntity<ApiResponse<MinistryResponse>> updateMinistry(
            @AuthenticationPrincipal UserPrincipal principal,
            @Parameter(description = "Ministry identifier")
            @PathVariable Long id,
            @Valid @RequestBody MinistryRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Ministry updated", ministryService.update(principal, id, request)));
    }

    @PostMapping("/attendance")
    @PreAuthorize("hasAnyRole('ORG_ADMIN','FINANCE_MANAGER','STAFF')")
    @Operation(
            summary = "Record attendance",
            description = "Creates a new church attendance record entry.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "201",
                    description = "Attendance recorded",
                    content = @Content(schema = @Schema(implementation = AttendanceRecordResponse.class))),
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
    public ResponseEntity<ApiResponse<AttendanceRecordResponse>> recordAttendance(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody AttendanceRecordRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Attendance recorded", attendanceService.record(principal, request)));
    }

    @GetMapping("/attendance")
    @Operation(
            summary = "List attendance records",
            description = "Returns all church attendance entries for the organization.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Attendance records",
                    content = @Content(schema = @Schema(implementation = AttendanceRecordResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "401",
                    description = "Unauthorized")
    })
    public ResponseEntity<ApiResponse<List<AttendanceRecordResponse>>> listAttendance(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.ok(attendanceService.list(principal)));
    }

    @GetMapping("/attendance/summary")
    @Operation(
            summary = "Attendance summary",
            description = "Returns attendance summary metrics for an optional date range.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Attendance summary",
                    content = @Content(schema = @Schema(implementation = AttendanceSummaryResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "401",
                    description = "Unauthorized")
    })
    public ResponseEntity<ApiResponse<AttendanceSummaryResponse>> attendanceSummary(
            @AuthenticationPrincipal UserPrincipal principal,
            @Parameter(description = "Period start date (ISO-8601). Optional.")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @Parameter(description = "Period end date (ISO-8601). Optional.")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(ApiResponse.ok(attendanceService.summary(principal, from, to)));
    }
}
