package com.project.daisyDonation.platform.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.project.daisyDonation.auth.dto.AuthResponse;
import com.project.daisyDonation.auth.dto.BootstrapSuperAdminRequest;
import com.project.daisyDonation.common.dto.ApiResponse;
import com.project.daisyDonation.platform.service.PlatformService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/platform")
@RequiredArgsConstructor
@Tag(name = "Platform", description = "One-time platform bootstrap (all ongoing operations use the owner dashboard)")
public class PlatformController {

    private final PlatformService platformService;

    @PostMapping("/bootstrap")
    @Operation(
            summary = "Bootstrap first super admin",
            description = """
                    Creates the first platform super administrator when none exists.
                    Requires the `X-Platform-Bootstrap-Secret` header matching `app.platform.bootstrap-secret`.
                    After bootstrap, sign in and use `/api/v1/platform/dashboard` for full platform access.
                    """)
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "201",
                    description = "Super administrator created",
                    content = @Content(schema = @Schema(implementation = AuthResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Bootstrap unavailable or super admin exists"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Invalid bootstrap secret")
    })
    public ResponseEntity<ApiResponse<AuthResponse>> bootstrapSuperAdmin(
            @Parameter(description = "Bootstrap secret configured in application properties")
            @RequestHeader("X-Platform-Bootstrap-Secret") String bootstrapSecret,
            @Valid @RequestBody BootstrapSuperAdminRequest request) {
        AuthResponse response = platformService.bootstrapSuperAdmin(bootstrapSecret, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Super administrator created", response));
    }
}
