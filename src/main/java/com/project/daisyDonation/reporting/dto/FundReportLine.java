package com.project.daisyDonation.reporting.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;

import com.project.daisyDonation.fund.entity.FundType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Fund Report Line")
public class FundReportLine {

    private Long fundId;
    private String fundCode;
    private String fundName;
    private FundType fundType;
    private BigDecimal revenue;
    private BigDecimal expenses;
    private BigDecimal netActivity;
    private BigDecimal operationalBalance;
}
