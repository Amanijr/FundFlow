package com.project.daisyDonation.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Request payload for login")
public class LoginRequest {
    @Schema(description = "email")
    @NotBlank
    @Email
    private String email;
    @Schema(description = "password")
    @NotBlank
    private String password;
}
