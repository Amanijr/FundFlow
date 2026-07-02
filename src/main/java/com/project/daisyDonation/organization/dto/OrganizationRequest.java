package com.project.daisyDonation.organization.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import com.project.daisyDonation.organization.entity.OrganizationType;

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
@Schema(description = "Request payload for organization")
public class OrganizationRequest {
    @Schema(description = "name")
    @NotBlank
    @Size(max = 255)
    private String name;
    @Schema(description = "URL-safe identifier; auto-generated from name if omitted")
    @Size(max = 100)
    private String slug;
    @Schema(description = "type")
    @NotNull
    private OrganizationType type;
    @Schema(description = "email")
    @Email
    @Size(max = 100)
    private String email;
    @Schema(description = "phone")
    @Size(max = 20)
    private String phone;
    @Schema(description = "address")
    @Size(max = 255)
    private String address;
    @Schema(description = "city")
    @Size(max = 100)
    private String city;
    @Schema(description = "state")
    @Size(max = 100)
    private String state;
    @Schema(description = "country")
    @Size(max = 100)
    private String country;
}
