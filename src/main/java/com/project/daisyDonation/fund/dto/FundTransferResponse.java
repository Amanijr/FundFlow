package com.project.daisyDonation.fund.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.project.daisyDonation.fund.entity.FundTransferStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Response payload for fund transfer")
public class FundTransferResponse {

    private Long id;
    private Long organizationId;
    private Long fromFundId;
    private String fromFundName;
    private Long toFundId;
    private String toFundName;
    private BigDecimal amount;
    private String reason;
    private LocalDateTime transferredAt;
    private Long transferredByUserId;
    private FundTransferStatus status;
}
