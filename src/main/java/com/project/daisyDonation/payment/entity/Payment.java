package com.project.daisyDonation.payment.entity;

import java.time.LocalDateTime;

import com.project.daisyDonation.common.entity.TenantEntity;
import com.project.daisyDonation.donation.entity.Donation;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "payment")
@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class Payment extends TenantEntity {

    @OneToOne(optional = false)
    @JoinColumn(name = "donation_id", nullable = false, unique = true)
    private Donation donation;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", length = 50)
    private PaymentMethod paymentMethod;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private PaymentChannel channel = PaymentChannel.GATEWAY;

    private String transactionId;

    private Boolean successful;

    private LocalDateTime processedAt;

    @Column(name = "recorded_by_user_id")
    private Long recordedByUserId;

    @Column(name = "receipt_number", length = 100)
    private String receiptNumber;

    @Column(name = "payment_notes", length = 500)
    private String paymentNotes;

    @Column(name = "collection_date")
    private LocalDateTime collectionDate;
}
