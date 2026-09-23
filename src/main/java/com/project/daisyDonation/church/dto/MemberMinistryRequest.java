package com.project.daisyDonation.church.dto;

import java.time.LocalDate;

import com.project.daisyDonation.church.entity.MemberMinistryStatus;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Assign a member to a ministry")
public class MemberMinistryRequest {

    @NotNull
    private Long memberId;

    @Size(max = 100)
    private String role;

    private MemberMinistryStatus status;

    private LocalDate joinedAt;
}
