package com.project.daisyDonation.notification.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoryPreferenceDto {

    private String category;
    private boolean enabled;
    private List<String> channels;
    private String minSeverity;
}
