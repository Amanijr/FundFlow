package com.project.daisyDonation.payment.service;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.project.daisyDonation.donation.entity.Donation;
import com.project.daisyDonation.payment.entity.Payment;
import com.project.daisyDonation.donation.entity.DonationStatus;
import com.project.daisyDonation.donation.entity.DonationType;
import com.project.daisyDonation.accounting.service.AccountingPostingService;
import com.project.daisyDonation.communication.service.CommunicationService;
import com.project.daisyDonation.common.exception.BadRequestException;
import com.project.daisyDonation.common.exception.ConflictException;
import com.project.daisyDonation.common.security.UserPrincipal;
import com.project.daisyDonation.donation.service.DonationService;
import com.project.daisyDonation.payment.dto.ManualPaymentRequest;
import com.project.daisyDonation.payment.dto.PaymentRequest;
import com.project.daisyDonation.payment.dto.PaymentResponse;
import com.project.daisyDonation.payment.entity.PaymentChannel;
import com.project.daisyDonation.pledge.service.PledgeService;
import com.project.daisyDonation.donation.repository.DonationRepository;
import com.project.daisyDonation.payment.repository.PaymentRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PaymentProcessingService {

    private final PaymentRepository paymentRepository;
    private final DonationRepository donationRepository;
    private final DonationService donationService;
    private final PledgeService pledgeService;
    private final AccountingPostingService accountingPostingService;
    private final CommunicationService communicationService;

    @Transactional
    public PaymentResponse processGatewayPayment(UserPrincipal principal, Long donationId, PaymentRequest request) {
        Donation donation = donationService.requireDonation(principal, donationId);
        validatePayableDonation(donation);

        if (paymentRepository.findByDonationIdAndOrganizationIdAndDeletedFalse(
                donationId, donation.getOrganization().getId()).isPresent()) {
            throw new ConflictException("Payment already exists for this donation");
        }

        boolean successful = !request.isSimulateFailure();

        Payment payment = buildPayment(donation, request.getPaymentMethod(), PaymentChannel.GATEWAY, successful);
        payment.setTransactionId(UUID.randomUUID().toString());
        payment.setProcessedAt(LocalDateTime.now());
        payment = paymentRepository.save(payment);

        return finalizePayment(principal, donation, payment, successful);
    }

    @Transactional
    public PaymentResponse recordManualPayment(
            UserPrincipal principal, Long donationId, ManualPaymentRequest request) {
        Donation donation = donationService.requireDonation(principal, donationId);
        validatePayableDonation(donation);

        if (donation.getDonationType() == DonationType.COLLECTION) {
            throw new BadRequestException("Collection donations are completed during session verification");
        }

        if (paymentRepository.findByDonationIdAndOrganizationIdAndDeletedFalse(
                donationId, donation.getOrganization().getId()).isPresent()) {
            throw new ConflictException("Payment already exists for this donation");
        }

        Payment payment = buildPayment(donation, request.getPaymentMethod(), PaymentChannel.MANUAL, true);
        payment.setRecordedByUserId(principal.getId());
        payment.setReceiptNumber(request.getReceiptNumber());
        payment.setCollectionDate(request.getCollectionDate());
        payment.setPaymentNotes(request.getPaymentNotes());
        payment.setTransactionId("MANUAL-" + UUID.randomUUID());
        payment.setProcessedAt(LocalDateTime.now());
        payment = paymentRepository.save(payment);

        return finalizePayment(principal, donation, payment, true);
    }

    private void validatePayableDonation(Donation donation) {
        if (donation.getDonationType() == DonationType.IN_KIND) {
            throw new BadRequestException("In-kind donations do not require payment processing");
        }

        if (donation.getStatus() != DonationStatus.PENDING) {
            throw new BadRequestException("Only pending donations can be paid");
        }
    }

    private Payment buildPayment(
            Donation donation,
            com.project.daisyDonation.payment.entity.PaymentMethod method,
            PaymentChannel channel,
            boolean successful) {
        Payment payment = new Payment();
        payment.setOrganization(donation.getOrganization());
        payment.setDonation(donation);
        payment.setPaymentMethod(method);
        payment.setChannel(channel);
        payment.setSuccessful(successful);
        return payment;
    }

    private PaymentResponse finalizePayment(
            UserPrincipal principal, Donation donation, Payment payment, boolean successful) {
        donation.setStatus(successful ? DonationStatus.COMPLETED : DonationStatus.FAILED);
        donationRepository.save(donation);

        if (successful && donation.getPledge() != null) {
            pledgeService.applyDonationToPledge(donation.getPledge(), donation.getAmount());
        }

        if (successful) {
            accountingPostingService.postDonationPayment(
                    donation.getOrganization(), principal.getId(), donation, payment);
            communicationService.sendAutoReceiptIfEnabled(donation, payment);
        }

        return PaymentResponse.builder()
                .paymentId(payment.getId())
                .donationId(donation.getId())
                .channel(payment.getChannel())
                .paymentMethod(payment.getPaymentMethod())
                .transactionId(payment.getTransactionId())
                .receiptNumber(payment.getReceiptNumber())
                .recordedByUserId(payment.getRecordedByUserId())
                .successful(successful)
                .processedAt(payment.getProcessedAt())
                .collectionDate(payment.getCollectionDate())
                .donationStatus(donation.getStatus())
                .build();
    }
}
