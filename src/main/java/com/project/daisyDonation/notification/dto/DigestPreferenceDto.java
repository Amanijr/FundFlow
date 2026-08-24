package com.project.daisyDonation.notification.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DigestPreferenceDto {

    private boolean enabled;
    private String frequency;
    private String time;
    private Integer dayOfWeek;
}
