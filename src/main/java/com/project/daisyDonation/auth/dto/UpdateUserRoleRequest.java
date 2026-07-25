package com.project.daisyDonation.auth.dto;

import com.project.daisyDonation.auth.entity.Role;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Request to change a user's role within the organization")
public class UpdateUserRoleRequest {

    @Schema(description = "new role", example = "FINANCE_MANAGER")
    @NotNull
    private Role role;
}
