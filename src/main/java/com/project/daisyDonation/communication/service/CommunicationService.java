package com.project.daisyDonation.communication.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.project.daisyDonation.common.exception.BadRequestException;
import com.project.daisyDonation.common.exception.ResourceNotFoundException;
import com.project.daisyDonation.common.security.UserPrincipal;
import com.project.daisyDonation.common.service.TenantSupport;
import com.project.daisyDonation.communication.config.CommunicationProperties;
import com.project.daisyDonation.communication.dto.CommunicationLogResponse;
import com.project.daisyDonation.communication.dto.ReceiptResponse;
import com.project.daisyDonation.communication.dto.SendMessageRequest;
import com.project.daisyDonation.communication.dto.SendReceiptRequest;
import com.project.daisyDonation.communication.entity.CommunicationChannel;
import com.project.daisyDonation.communication.entity.CommunicationLog;
import com.project.daisyDonation.communication.entity.CommunicationReferenceType;
import com.project.daisyDonation.communication.entity.CommunicationStatus;
import com.project.daisyDonation.communication.entity.CommunicationType;
import com.project.daisyDonation.communication.repository.CommunicationLogRepository;
import com.project.daisyDonation.communication.service.provider.ChannelSenderRegistry;
import com.project.daisyDonation.donation.entity.Donation;
import com.project.daisyDonation.donation.repository.DonationRepository;
import com.project.daisyDonation.donor.entity.Donor;
import com.project.daisyDonation.organization.entity.Organization;
import com.project.daisyDonation.payment.entity.Payment;
import com.project.daisyDonation.payment.repository.PaymentRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CommunicationService {

    private final CommunicationLogRepository communicationLogRepository;
    private final DonationRepository donationRepository;
    private final PaymentRepository paymentRepository;
    private final ReceiptService receiptService;
    private final ChannelSenderRegistry channelSenderRegistry;
    private final CommunicationProperties communicationProperties;
    private final TenantSupport tenantSupport;

    @Transactional
    public CommunicationLogResponse sendMessage(UserPrincipal principal, SendMessageRequest request) {
        Organization organization = tenantSupport.organization(principal);
        return dispatch(
                organization,
                request.getChannel(),
                request.getMessageType(),
                request.getRecipient(),
                request.getSubject(),
                request.getBody(),
                request.getReferenceType(),
                request.getReferenceId());
    }

    @Transactional(readOnly = true)
    public List<CommunicationLogResponse> list(UserPrincipal principal) {
        Long organizationId = tenantSupport.organizationId(principal);
        return communicationLogRepository.findByOrganizationIdAndDeletedFalseOrderByCreatedAtDesc(organizationId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<CommunicationLogResponse> listForDonation(UserPrincipal principal, Long donationId) {
        Long organizationId = tenantSupport.organizationId(principal);
        requireDonation(organizationId, donationId);
        return communicationLogRepository
                .findByOrganizationIdAndReferenceTypeAndReferenceIdAndDeletedFalseOrderByCreatedAtDesc(
                        organizationId, CommunicationReferenceType.DONATION, donationId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public ReceiptResponse previewReceipt(UserPrincipal principal, Long donationId) {
        Donation donation = requireDonation(tenantSupport.organizationId(principal), donationId);
        Payment payment = requirePayment(donation);
        return receiptService.buildReceipt(donation, payment);
    }

    @Transactional
    public CommunicationLogResponse sendReceipt(
            UserPrincipal principal, Long donationId, SendReceiptRequest request) {
        Donation donation = requireDonation(tenantSupport.organizationId(principal), donationId);
        Payment payment = requirePayment(donation);
        ReceiptResponse receipt = receiptService.buildReceipt(donation, payment);

        CommunicationChannel channel = request.getChannel() != null
                ? request.getChannel()
                : communicationProperties.getDefaultReceiptChannel();
        String recipient = resolveRecipient(donation, channel, request.getRecipientOverride());

        if (payment.getReceiptNumber() == null || payment.getReceiptNumber().isBlank()) {
            payment.setReceiptNumber(receipt.getReceiptNumber());
            paymentRepository.save(payment);
        }

        return dispatch(
                donation.getOrganization(),
                channel,
                CommunicationType.RECEIPT,
                recipient,
                receipt.getSubject(),
                receipt.getBody(),
                CommunicationReferenceType.DONATION,
                donation.getId());
    }

    @Transactional
    public void sendAutoReceiptIfEnabled(Donation donation, Payment payment) {
        if (!communicationProperties.isAutoReceiptEnabled()) {
            return;
        }

        if (donation.isAnonymous() || donation.getDonor() == null) {
            return;
        }

        CommunicationChannel channel = communicationProperties.getDefaultReceiptChannel();
        String recipient = resolveRecipient(donation, channel, null);
        if (recipient == null || recipient.isBlank()) {
            return;
        }

        ReceiptResponse receipt = receiptService.buildReceipt(donation, payment);
        if (payment.getReceiptNumber() == null || payment.getReceiptNumber().isBlank()) {
            payment.setReceiptNumber(receipt.getReceiptNumber());
            paymentRepository.save(payment);
        }

        dispatch(
                donation.getOrganization(),
                channel,
                CommunicationType.RECEIPT,
                recipient,
                receipt.getSubject(),
                receipt.getBody(),
                CommunicationReferenceType.DONATION,
                donation.getId());
    }

    private CommunicationLogResponse dispatch(
            Organization organization,
            CommunicationChannel channel,
            CommunicationType messageType,
            String recipient,
            String subject,
            String body,
            CommunicationReferenceType referenceType,
            Long referenceId) {
        CommunicationLog log = new CommunicationLog();
        log.setOrganization(organization);
        log.setChannel(channel);
        log.setMessageType(messageType);
        log.setRecipient(recipient);
        log.setSubject(subject);
        log.setBody(body);
        log.setReferenceType(referenceType);
        log.setReferenceId(referenceId);

        try {
            channelSenderRegistry.get(channel).send(recipient, subject, body);
            log.setStatus(CommunicationStatus.SENT);
            log.setSentAt(LocalDateTime.now());
        } catch (RuntimeException ex) {
            log.setStatus(CommunicationStatus.FAILED);
            log.setFailureReason(ex.getMessage());
        }

        return toResponse(communicationLogRepository.save(log));
    }

    private String resolveRecipient(Donation donation, CommunicationChannel channel, String override) {
        if (override != null && !override.isBlank()) {
            return override;
        }

        Donor donor = donation.getDonor();
        if (donor == null) {
            throw new BadRequestException("No donor contact available for this donation");
        }

        return switch (channel) {
            case EMAIL -> donor.getEmail();
            case SMS, WHATSAPP -> donor.getPhone();
        };
    }

    private Donation requireDonation(Long organizationId, Long donationId) {
        return donationRepository.findByIdAndOrganizationIdAndDeletedFalse(donationId, organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("Donation not found"));
    }

    private Payment requirePayment(Donation donation) {
        return paymentRepository
                .findByDonationIdAndOrganizationIdAndDeletedFalse(donation.getId(), donation.getOrganization().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found for donation"));
    }

    private CommunicationLogResponse toResponse(CommunicationLog log) {
        return CommunicationLogResponse.builder()
                .id(log.getId())
                .channel(log.getChannel())
                .messageType(log.getMessageType())
                .recipient(log.getRecipient())
                .subject(log.getSubject())
                .body(log.getBody())
                .status(log.getStatus())
                .referenceType(log.getReferenceType())
                .referenceId(log.getReferenceId())
                .sentAt(log.getSentAt())
                .failureReason(log.getFailureReason())
                .createdAt(log.getCreatedAt())
                .build();
    }
}
