package com.project.daisyDonation.platform.dto;

import com.project.daisyDonation.auth.entity.Role;

import io.swagger.v3.oas.annotations.media.Schema;
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
@Schema(description = "Request to create a user in any tenant from the platform owner dashboard")
public class PlatformCreateUserRequest {

    @Schema(description = "tenant organization identifier", example = "42")
    @NotNull
    private Long organizationId;

    @Schema(description = "email", example = "finance@foundation.org")
    @NotBlank
    @Email
    @Size(max = 100)
    private String email;

    @Schema(description = "password", example = "password123")
    @NotBlank
    @Size(min = 8, max = 100)
    private String password;

    @Schema(description = "first name", example = "Amani")
    @NotBlank
    @Size(max = 50)
    private String firstName;

    @Schema(description = "last name", example = "Junior")
    @NotBlank
    @Size(max = 50)
    private String lastName;

    @Schema(description = "assigned role", example = "FINANCE_MANAGER")
    @NotNull
    private Role role;
}
