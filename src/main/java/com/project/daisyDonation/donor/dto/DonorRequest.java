package com.project.daisyDonation.donor.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import jakarta.validation.constraints.Email;
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
@Schema(description = "Request payload for donor")
public class DonorRequest {
    @Schema(description = "first name")
    @NotBlank
    @Size(max = 50)
    private String firstName;
    @Schema(description = "last name")
    @NotBlank
    @Size(max = 50)
    private String lastName;
    @Schema(description = "email")
    @NotBlank
    @Email
    @Size(max = 100)
    private String email;
    @Schema(description = "phone")
    @NotBlank
    @Size(max = 15)
    private String phone;
    @Schema(description = "address")
    @Size(max = 255)
    private String address;
    @Schema(description = "city")
    @Size(max = 100)
    private String city;
    @Schema(description = "state")
    @Size(max = 100)
    private String state;
    @Schema(description = "country")
    @Size(max = 100)
    private String country;
}
