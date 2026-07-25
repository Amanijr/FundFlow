package com.project.daisyDonation.communication.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import com.project.daisyDonation.communication.entity.CommunicationChannel;
import com.project.daisyDonation.communication.entity.CommunicationReferenceType;
import com.project.daisyDonation.communication.entity.CommunicationType;

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
@Schema(description = "Request payload for send message")
public class SendMessageRequest {
    @Schema(description = "channel")
    @NotNull
    private CommunicationChannel channel;
    @Schema(description = "message type")
    @NotNull
    private CommunicationType messageType;
    @Schema(description = "recipient")
    @NotBlank
    @Size(max = 255)
    private String recipient;
    @Schema(description = "subject")
    @Size(max = 500)
    private String subject;
    @Schema(description = "body")
    @NotBlank
    @Size(max = 4000)
    private String body;
    @Schema(description = "reference type")
    private CommunicationReferenceType referenceType;
    @Schema(description = "reference id")
    private Long referenceId;
}
