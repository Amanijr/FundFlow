package com.project.daisyDonation.campaign.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import com.project.daisyDonation.campaign.entity.CampaignStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Response payload for campaign")
public class CampaignResponse {

    private Long id;
    private Long organizationId;
    private String name;
    private String description;
    private BigDecimal targetAmount;
    private LocalDate startDate;
    private LocalDate endDate;
    private CampaignStatus status;
    private LocalDateTime createdAt;
}
