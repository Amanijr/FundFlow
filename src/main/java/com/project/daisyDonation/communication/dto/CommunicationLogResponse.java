package com.project.daisyDonation.communication.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;

import com.project.daisyDonation.communication.entity.CommunicationChannel;
import com.project.daisyDonation.communication.entity.CommunicationReferenceType;
import com.project.daisyDonation.communication.entity.CommunicationStatus;
import com.project.daisyDonation.communication.entity.CommunicationType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Response payload for communication log")
public class CommunicationLogResponse {

    private Long id;
    private CommunicationChannel channel;
    private CommunicationType messageType;
    private String recipient;
    private String subject;
    private String body;
    private CommunicationStatus status;
    private CommunicationReferenceType referenceType;
    private Long referenceId;
    private LocalDateTime sentAt;
    private String failureReason;
    private LocalDateTime createdAt;
}
