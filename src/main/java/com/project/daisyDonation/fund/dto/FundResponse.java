package com.project.daisyDonation.fund.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.project.daisyDonation.fund.entity.FundType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Response payload for fund")
public class FundResponse {

    private Long id;
    private Long organizationId;
    private String name;
    private String code;
    private FundType type;
    private String description;
    private BigDecimal openingBalance;
    private BigDecimal currentBalance;
    private boolean active;
    private LocalDateTime createdAt;
}
