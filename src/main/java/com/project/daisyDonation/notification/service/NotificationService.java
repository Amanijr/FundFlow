package com.project.daisyDonation.notification.service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Service;

import com.project.daisyDonation.common.exception.ResourceNotFoundException;
import com.project.daisyDonation.common.security.UserPrincipal;
import com.project.daisyDonation.common.service.TenantSupport;
import com.project.daisyDonation.notification.dto.ActivityFeedResponse;
import com.project.daisyDonation.notification.dto.CategoryPreferenceDto;
import com.project.daisyDonation.notification.dto.DigestPreferenceDto;
import com.project.daisyDonation.notification.dto.NotificationListResponse;
import com.project.daisyDonation.notification.dto.NotificationPreferencesResponse;
import com.project.daisyDonation.notification.dto.SystemAnnouncementResponse;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private static final List<String> CATEGORIES = List.of(
            "financial",
            "donations",
            "campaigns",
            "budgets",
            "expenses",
            "users",
            "security",
            "workflow",
            "reports",
            "system");

    private final TenantSupport tenantSupport;
    private final Map<String, NotificationPreferencesResponse> preferencesByUser = new ConcurrentHashMap<>();

    public long unreadCount() {
        return 0;
    }

    public NotificationListResponse list() {
        return NotificationListResponse.builder()
                .items(List.of())
                .page(0)
                .totalPages(0)
                .totalElements(0)
                .build();
    }

    public void requireExisting(String notificationId) {
        throw new ResourceNotFoundException("Notification not found");
    }

    public void markAllRead() {
        // In-app notifications are not persisted yet.
    }

    public NotificationPreferencesResponse getPreferences(UserPrincipal principal) {
        return preferencesByUser.computeIfAbsent(preferenceKey(principal), key -> defaultPreferences(principal));
    }

    public NotificationPreferencesResponse updatePreferences(
            UserPrincipal principal, NotificationPreferencesResponse updates) {
        NotificationPreferencesResponse current = getPreferences(principal);
        if (updates.getCategories() != null) {
            current.setCategories(updates.getCategories());
        }
        if (updates.getDigest() != null) {
            current.setDigest(updates.getDigest());
        }
        if (updates.getGlobalEnabled() != null) {
            current.setGlobalEnabled(updates.getGlobalEnabled());
        }
        current.setUpdatedAt(Instant.now());
        preferencesByUser.put(preferenceKey(principal), current);
        return current;
    }

    public List<SystemAnnouncementResponse> activeAnnouncements() {
        return List.of();
    }

    public ActivityFeedResponse activityFeed() {
        return ActivityFeedResponse.builder().items(List.of()).build();
    }

    private String preferenceKey(UserPrincipal principal) {
        return principal.getId() + ":" + tenantSupport.organizationId(principal);
    }

    private NotificationPreferencesResponse defaultPreferences(UserPrincipal principal) {
        List<CategoryPreferenceDto> categories = new ArrayList<>();
        for (String category : CATEGORIES) {
            boolean highPriority = "financial".equals(category) || "system".equals(category);
            categories.add(CategoryPreferenceDto.builder()
                    .category(category)
                    .enabled(true)
                    .channels(List.of("in_app", "email"))
                    .minSeverity(highPriority ? "warning" : "info")
                    .build());
        }
        return NotificationPreferencesResponse.builder()
                .userId(principal.getId())
                .organizationId(tenantSupport.organizationId(principal))
                .categories(categories)
                .digest(DigestPreferenceDto.builder()
                        .enabled(false)
                        .frequency("daily")
                        .time("09:00")
                        .build())
                .globalEnabled(true)
                .updatedAt(Instant.now())
                .build();
    }
}
