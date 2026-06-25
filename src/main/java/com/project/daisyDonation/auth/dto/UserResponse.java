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
@Schema(description = "Response payload for user")
public class UserResponse {

    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private Role role;
    private Long organizationId;
    private boolean enabled;
}
