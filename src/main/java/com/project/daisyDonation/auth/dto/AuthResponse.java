package com.project.daisyDonation.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import com.project.daisyDonation.auth.entity.Role;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Response payload for auth")
public class AuthResponse {

    private String accessToken;
    private String tokenType;
    private Long userId;
    private Long organizationId;
    private Role role;
    private String email;
    private String firstName;
    private String lastName;
}
