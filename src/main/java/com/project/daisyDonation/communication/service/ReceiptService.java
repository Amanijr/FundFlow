package com.project.daisyDonation.communication.service;

import java.time.format.DateTimeFormatter;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.project.daisyDonation.common.exception.BadRequestException;
import com.project.daisyDonation.common.exception.ResourceNotFoundException;
import com.project.daisyDonation.communication.dto.ReceiptResponse;
import com.project.daisyDonation.donation.entity.Donation;
import com.project.daisyDonation.donation.entity.DonationStatus;
import com.project.daisyDonation.payment.entity.Payment;

@Service
public class ReceiptService {

    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

    @Transactional(readOnly = true)
    public ReceiptResponse buildReceipt(Donation donation, Payment payment) {
        if (donation.getStatus() != DonationStatus.COMPLETED) {
            throw new BadRequestException("Receipts are only available for completed donations");
        }

        if (payment == null || !Boolean.TRUE.equals(payment.getSuccessful())) {
            throw new BadRequestException("A successful payment is required to generate a receipt");
        }

        String receiptNumber = ensureReceiptNumber(payment);
        String organizationName = donation.getOrganization().getName();
        String donorName = resolveDonorName(donation);
        String subject = "Donation Receipt - " + receiptNumber;
        String body = buildReceiptBody(donation, payment, receiptNumber, organizationName, donorName);

        return ReceiptResponse.builder()
                .donationId(donation.getId())
                .paymentId(payment.getId())
                .receiptNumber(receiptNumber)
                .organizationName(organizationName)
                .donorName(donorName)
                .anonymous(donation.isAnonymous())
                .amount(donation.getAmount())
                .paymentMethod(payment.getPaymentMethod())
                .donationTime(donation.getDonationTime() != null
                        ? donation.getDonationTime()
                        : payment.getProcessedAt())
                .subject(subject)
                .body(body)
                .build();
    }

    public String ensureReceiptNumber(Payment payment) {
        if (payment.getReceiptNumber() != null && !payment.getReceiptNumber().isBlank()) {
            return payment.getReceiptNumber();
        }
        return "RCP-" + payment.getId();
    }

    private String resolveDonorName(Donation donation) {
        if (donation.isAnonymous() || donation.getDonor() == null) {
            return "Anonymous Donor";
        }
        return donation.getDonor().getFirstName() + " " + donation.getDonor().getLastName();
    }

    private String buildReceiptBody(
            Donation donation,
            Payment payment,
            String receiptNumber,
            String organizationName,
            String donorName) {
        String donationTime = donation.getDonationTime() != null
                ? donation.getDonationTime().format(DATE_FORMAT)
                : payment.getProcessedAt() != null
                        ? payment.getProcessedAt().format(DATE_FORMAT)
                        : "N/A";

        return """
                Thank you for your generous donation.

                Organization: %s
                Receipt Number: %s
                Donor: %s
                Amount: %s
                Payment Method: %s
                Date: %s

                This receipt acknowledges your contribution. Please retain it for your records.
                """.formatted(
                organizationName,
                receiptNumber,
                donorName,
                donation.getAmount(),
                payment.getPaymentMethod() != null ? payment.getPaymentMethod() : "N/A",
                donationTime)
                .trim();
    }
}
