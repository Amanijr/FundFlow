package com.project.daisyDonation.church.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.project.daisyDonation.donor.entity.MembershipStatus;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Church member")
public class MemberResponse {

    private Long id;
    private Long organizationId;
    private String memberNumber;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String address;
    private String city;
    private String state;
    private String country;
    private MembershipStatus membershipStatus;
    private LocalDate joinedAt;
    private String notes;
    private LocalDateTime createdAt;
}
