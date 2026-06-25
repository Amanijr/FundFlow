package com.project.daisyDonation.auth.dto;

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
@Schema(description = "Request to create an additional platform super administrator")
public class CreateSuperAdminRequest {

    @Schema(description = "email", example = "ops@fundflow.io")
    @NotBlank
    @Email
    @Size(max = 100)
    private String email;

    @Schema(description = "password", example = "password123")
    @NotBlank
    @Size(min = 8, max = 100)
    private String password;

    @Schema(description = "first name", example = "Ops")
    @NotBlank
    @Size(max = 50)
    private String firstName;

    @Schema(description = "last name", example = "Admin")
    @NotBlank
    @Size(max = 50)
    private String lastName;
}
