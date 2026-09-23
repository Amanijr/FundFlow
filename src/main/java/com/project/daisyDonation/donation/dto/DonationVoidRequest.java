package com.project.daisyDonation.donation.dto;

import io.swagger.v3.oas.annotations.media.Schema;
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
@Schema(description = "Void a completed gift and reverse its journal")
public class DonationVoidRequest {

    @NotBlank
    @Size(max = 500)
    private String reason;
}
