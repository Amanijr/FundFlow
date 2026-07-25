package com.project.daisyDonation.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import com.project.daisyDonation.organization.dto.OrganizationRequest;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
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
@Schema(description = "Request payload for register")
public class RegisterRequest {
    @Schema(description = "organization")
    @NotNull
    @Valid
    private OrganizationRequest organization;
    @Schema(description = "email")
    @NotBlank
    @Email
    @Size(max = 100)
    private String email;
    @Schema(description = "password")
    @NotBlank
    @Size(min = 8, max = 100)
    private String password;
    @Schema(description = "first name")
    @NotBlank
    @Size(max = 50)
    private String firstName;
    @Schema(description = "last name")
    @NotBlank
    @Size(max = 50)
    private String lastName;
}
