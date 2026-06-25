package com.project.daisyDonation.organization.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;

import com.project.daisyDonation.organization.entity.OrganizationType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Response payload for organization")
public class OrganizationResponse {

    private Long id;
    private String name;
    private String slug;
    private OrganizationType type;
    private String email;
    private String phone;
    private String address;
    private String city;
    private String state;
    private String country;
    private boolean active;
    private LocalDateTime createdAt;
}
