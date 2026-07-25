package com.project.daisyDonation.analytics.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Insight priority level")
public enum InsightSeverity {
    INFO,
    WARNING,
    CRITICAL
}
