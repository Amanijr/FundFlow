package com.project.daisyDonation.notification.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.project.daisyDonation.common.config.OpenApiConfig;
import com.project.daisyDonation.common.dto.ApiResponse;
import com.project.daisyDonation.common.security.UserPrincipal;
import com.project.daisyDonation.notification.dto.SystemAnnouncementResponse;
import com.project.daisyDonation.notification.service.NotificationService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/announcements")
@RequiredArgsConstructor
@Tag(name = "Announcements", description = "Active system banners for the current organization")
@SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
public class AnnouncementController {

    private final NotificationService notificationService;

    @GetMapping("/active")
    @Operation(summary = "List active announcements")
    public ResponseEntity<ApiResponse<List<SystemAnnouncementResponse>>> active(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.ok(notificationService.activeAnnouncements()));
    }
}
