package com.project.daisyDonation.auth.dto;

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
@Schema(description = "Request to invite a user into the current organization")
public class CreateUserRequest {

    @Schema(description = "email", example = "staff@church.org")
    @NotBlank
    @Email
    @Size(max = 100)
    private String email;

    @Schema(description = "password", example = "password123")
    @NotBlank
    @Size(min = 8, max = 100)
    private String password;

    @Schema(description = "first name", example = "John")
    @NotBlank
    @Size(max = 50)
    private String firstName;

    @Schema(description = "last name", example = "Usher")
    @NotBlank
    @Size(max = 50)
    private String lastName;

    @Schema(description = "assigned role", example = "STAFF")
    @NotNull
    private Role role;
}
