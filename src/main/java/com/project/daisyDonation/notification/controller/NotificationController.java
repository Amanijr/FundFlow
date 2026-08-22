package com.project.daisyDonation.notification.controller;

import org.springframework.http.ResponseEntity;
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
import com.project.daisyDonation.notification.dto.NotificationListResponse;
import com.project.daisyDonation.notification.dto.NotificationPreferencesResponse;
import com.project.daisyDonation.notification.service.NotificationService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
@Tag(name = "Notifications", description = "In-app notification inbox and preferences")
@SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping("/unread-count")
    @Operation(summary = "Unread notification count")
    public ResponseEntity<ApiResponse<Long>> unreadCount(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.ok(notificationService.unreadCount()));
    }

    @GetMapping
    @Operation(summary = "List notifications")
    public ResponseEntity<ApiResponse<NotificationListResponse>> list(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.ok(notificationService.list()));
    }

    @GetMapping("/preferences")
    @Operation(summary = "Get notification preferences")
    public ResponseEntity<ApiResponse<NotificationPreferencesResponse>> getPreferences(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.ok(notificationService.getPreferences(principal)));
    }

    @PutMapping("/preferences")
    @Operation(summary = "Update notification preferences")
    public ResponseEntity<ApiResponse<NotificationPreferencesResponse>> updatePreferences(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody NotificationPreferencesResponse request) {
        return ResponseEntity.ok(ApiResponse.ok(notificationService.updatePreferences(principal, request)));
    }

    @PostMapping("/read-all")
    @Operation(summary = "Mark all notifications read")
    public ResponseEntity<ApiResponse<Void>> markAllRead(@AuthenticationPrincipal UserPrincipal principal) {
        notificationService.markAllRead();
        return ResponseEntity.ok(ApiResponse.ok("All notifications marked read", null));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get notification")
    public ResponseEntity<ApiResponse<Void>> getById(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable String id) {
        notificationService.requireExisting(id);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @PostMapping("/{id}/read")
    @Operation(summary = "Mark notification read")
    public ResponseEntity<ApiResponse<Void>> markRead(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable String id) {
        notificationService.requireExisting(id);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @PostMapping("/{id}/acknowledge")
    @Operation(summary = "Acknowledge notification")
    public ResponseEntity<ApiResponse<Void>> acknowledge(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable String id) {
        notificationService.requireExisting(id);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @PostMapping("/{id}/archive")
    @Operation(summary = "Archive notification")
    public ResponseEntity<ApiResponse<Void>> archive(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable String id) {
        notificationService.requireExisting(id);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }
}
