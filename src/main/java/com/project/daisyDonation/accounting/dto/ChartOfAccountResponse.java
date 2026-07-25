package com.project.daisyDonation.accounting.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;

import com.project.daisyDonation.accounting.entity.AccountType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Response payload for chart of account")
public class ChartOfAccountResponse {

    private Long id;
    private String code;
    private String name;
    private AccountType accountType;
    private String description;
    private boolean active;
    private boolean systemAccount;
    private LocalDateTime createdAt;
}
