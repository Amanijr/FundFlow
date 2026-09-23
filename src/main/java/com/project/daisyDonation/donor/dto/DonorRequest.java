package com.project.daisyDonation.donor.dto;

import java.time.LocalDate;

import com.project.daisyDonation.donor.entity.MembershipStatus;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Create or update a fundraising donor")
public class DonorRequest {
    @NotBlank
    @Size(max = 50)
    private String firstName;

    @NotBlank
    @Size(max = 50)
    private String lastName;

    @Size(max = 100)
    private String email;

    @Size(max = 15)
    private String phone;

    @Size(max = 255)
    private String address;

    @Size(max = 100)
    private String city;

    @Size(max = 100)
    private String state;

    @Size(max = 100)
    private String country;

    private MembershipStatus membershipStatus;

    private LocalDate joinedAt;

    @Size(max = 2000)
    private String notes;
}
