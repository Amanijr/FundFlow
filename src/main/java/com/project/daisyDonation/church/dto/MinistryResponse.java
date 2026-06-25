package com.project.daisyDonation.church.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Response payload for ministry")
public class MinistryResponse {

    private Long id;
    private String name;
    private String code;
    private String description;
    private String leaderName;
    private boolean active;
    private LocalDateTime createdAt;
}
