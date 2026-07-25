package com.project.daisyDonation.accounting.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import com.project.daisyDonation.accounting.entity.JournalSourceType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Response payload for journal entry")
public class JournalEntryResponse {

    private Long id;
    private LocalDate entryDate;
    private String description;
    private JournalSourceType sourceType;
    private Long sourceId;
    private Long postedByUserId;
    private String fiscalPeriodName;
    private BigDecimal totalDebits;
    private BigDecimal totalCredits;
    private List<JournalLineResponse> lines;
}
