package com.project.daisyDonation.communication.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import com.project.daisyDonation.communication.entity.CommunicationChannel;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Request payload for send receipt")
public class SendReceiptRequest {
    @Schema(description = "channel")
    private CommunicationChannel channel;
    @Schema(description = "recipient override")
    @Size(max = 255)
    private String recipientOverride;
}
