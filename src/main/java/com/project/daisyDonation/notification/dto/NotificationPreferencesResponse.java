package com.project.daisyDonation.notification.dto;

import java.time.Instant;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationPreferencesResponse {

    private Long userId;
    private Long organizationId;
    private List<CategoryPreferenceDto> categories;
    private DigestPreferenceDto digest;
    private Boolean globalEnabled;
    private Instant updatedAt;
}
