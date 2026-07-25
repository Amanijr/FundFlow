package com.project.daisyDonation.pledge.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import com.project.daisyDonation.pledge.entity.PledgeStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Response payload for pledge")
public class PledgeResponse {

    private Long id;
    private Long organizationId;
    private Long donorId;
    private String donorName;
    private BigDecimal pledgedAmount;
    private BigDecimal fulfilledAmount;
    private BigDecimal remainingAmount;
    private LocalDate dueDate;
    private PledgeStatus status;
    private String notes;
    private LocalDateTime createdAt;
}
