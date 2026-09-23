package com.project.daisyDonation.church.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.project.daisyDonation.church.entity.MemberMinistryStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MemberMinistryResponse {

    private Long id;
    private Long memberId;
    private String memberName;
    private Long ministryId;
    private String ministryName;
    private String role;
    private MemberMinistryStatus status;
    private LocalDate joinedAt;
    private LocalDateTime createdAt;
}
