package com.project.daisyDonation.platform.dto;

import com.project.daisyDonation.auth.entity.Role;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "User record visible to platform super administrators")
public class PlatformUserResponse {

    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private Role role;
    private Long organizationId;
    private String organizationName;
    private boolean enabled;
}
