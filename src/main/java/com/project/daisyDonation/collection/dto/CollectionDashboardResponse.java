package com.project.daisyDonation.collection.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Response payload for collection dashboard")
public class CollectionDashboardResponse {

    private BigDecimal totalVerifiedAmount;
    private long totalVerifiedSessions;
    private List<CollectionTypeSummary> byCollectionType;
    private List<CollectionSessionResponse> recentSessions;
}
