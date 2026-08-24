package com.project.daisyDonation.notification.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SystemAnnouncementResponse {

    private String id;
    private String severity;
    private String title;
    private String description;
    private boolean dismissible;
    private String href;
}
