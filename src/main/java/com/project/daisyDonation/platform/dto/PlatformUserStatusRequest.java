package com.project.daisyDonation.platform.dto;

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
@Schema(description = "Request to enable or disable a user from the platform owner dashboard")
public class PlatformUserStatusRequest {

    @Schema(description = "whether the user account is enabled", example = "false")
    @NotNull
    private Boolean enabled;
}
