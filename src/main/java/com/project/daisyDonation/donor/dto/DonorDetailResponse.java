package com.project.daisyDonation.donor.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import com.project.daisyDonation.donation.dto.DonationSummaryResponse;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Response payload for donor detail")
public class DonorDetailResponse {

    private Long id;
    private Long organizationId;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String address;
    private String city;
    private String state;
    private String country;
    private LocalDateTime createdAt;
    private BigDecimal lifetimeValue;
    private long donationCount;
    private List<DonationSummaryResponse> recentDonations;
}
