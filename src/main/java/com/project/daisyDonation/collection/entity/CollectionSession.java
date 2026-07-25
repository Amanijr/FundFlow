package com.project.daisyDonation.collection.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.project.daisyDonation.donation.entity.Donation;
import com.project.daisyDonation.common.entity.TenantEntity;
import com.project.daisyDonation.campaign.entity.Campaign;
import com.project.daisyDonation.payment.entity.PaymentMethod;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "collection_session")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CollectionSession extends TenantEntity {

    @Enumerated(EnumType.STRING)
    @Column(name = "collection_type", nullable = false, length = 50)
    private CollectionType collectionType;

    @Column(length = 255)
    private String title;

    @Column(length = 1000)
    private String description;

    @Column(name = "total_amount", precision = 19, scale = 2)
    private BigDecimal totalAmount;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", length = 50)
    private PaymentMethod paymentMethod;

    @Column(name = "collected_at")
    private LocalDateTime collectedAt;

    @Column(length = 255)
    private String location;

    @Column(name = "collected_by_user_id")
    private Long collectedByUserId;

    @Column(name = "verified_by_user_id")
    private Long verifiedByUserId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private CollectionSessionStatus status = CollectionSessionStatus.DRAFT;

    @ManyToOne
    @JoinColumn(name = "campaign_id")
    private Campaign campaign;

    @OneToOne
    @JoinColumn(name = "donation_id")
    private Donation donation;

    @Column(length = 1000)
    private String notes;
}
