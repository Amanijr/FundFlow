package com.project.daisyDonation.campaign.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.project.daisyDonation.campaign.entity.CampaignStatus;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Request payload for campaign")
public class CampaignRequest {
    @Schema(description = "name")
    @NotBlank
    @Size(max = 255)
    private String name;
    @Schema(description = "description")
    @Size(max = 2000)
    private String description;
    @Schema(description = "target amount")
    private BigDecimal targetAmount;
    @Schema(description = "start date")
    private LocalDate startDate;
    @Schema(description = "end date")
    private LocalDate endDate;
    @Schema(description = "status")
    private CampaignStatus status;
}
