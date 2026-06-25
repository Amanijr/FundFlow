package com.project.daisyDonation.communication.entity;

import java.time.LocalDateTime;

import com.project.daisyDonation.common.entity.TenantEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "communication_log")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CommunicationLog extends TenantEntity {

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private CommunicationChannel channel;

    @Enumerated(EnumType.STRING)
    @Column(name = "message_type", nullable = false, length = 50)
    private CommunicationType messageType;

    @Column(nullable = false, length = 255)
    private String recipient;

    @Column(length = 500)
    private String subject;

    @Column(nullable = false, length = 4000)
    private String body;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private CommunicationStatus status = CommunicationStatus.PENDING;

    @Enumerated(EnumType.STRING)
    @Column(name = "reference_type", length = 50)
    private CommunicationReferenceType referenceType;

    @Column(name = "reference_id")
    private Long referenceId;

    @Column(name = "sent_at")
    private LocalDateTime sentAt;

    @Column(name = "failure_reason", length = 1000)
    private String failureReason;
}
